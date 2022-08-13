// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import {StringUtils} from "./libraries/StringUtils.sol";
import {Base64} from "./libraries/Base64.sol";

contract Domains is ERC721URIStorage {
    using Counters for Counters.Counter;
    string public _tld;
    string svgPartOne =
        '<svg xmlns="http://www.w3.org/2000/svg" width="270" height="270" fill="none"><path fill="url(#B)" d="M0 0h270v270H0z"/><defs><filter id="A" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" height="270" width="270"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity=".225" width="200%" height="200%"/></filter></defs><path d="M72.863 42.949c-.668-.387-1.426-.59-2.197-.59s-1.529.204-2.197.59l-10.081 6.032-6.85 3.934-10.081 6.032c-.668.387-1.426.59-2.197.59s-1.529-.204-2.197-.59l-8.013-4.721a4.52 4.52 0 0 1-1.589-1.616c-.384-.665-.594-1.418-.608-2.187v-9.31c-.013-.775.185-1.538.572-2.208a4.25 4.25 0 0 1 1.625-1.595l7.884-4.59c.668-.387 1.426-.59 2.197-.59s1.529.204 2.197.59l7.884 4.59a4.52 4.52 0 0 1 1.589 1.616c.384.665.594 1.418.608 2.187v6.032l6.85-4.065v-6.032c.013-.775-.185-1.538-.572-2.208a4.25 4.25 0 0 0-1.625-1.595L41.456 24.59c-.668-.387-1.426-.59-2.197-.59s-1.529.204-2.197.59l-14.864 8.655a4.25 4.25 0 0 0-1.625 1.595c-.387.67-.585 1.434-.572 2.208v17.441c-.013.775.185 1.538.572 2.208a4.25 4.25 0 0 0 1.625 1.595l14.864 8.655c.668.387 1.426.59 2.197.59s1.529-.204 2.197-.59l10.081-5.901 6.85-4.065 10.081-5.901c.668-.387 1.426-.59 2.197-.59s1.529.204 2.197.59l7.884 4.59a4.52 4.52 0 0 1 1.589 1.616c.384.665.594 1.418.608 2.187v9.311c.013.775-.185 1.538-.572 2.208a4.25 4.25 0 0 1-1.625 1.595l-7.884 4.721c-.668.387-1.426.59-2.197.59s-1.529-.204-2.197-.59l-7.884-4.59a4.52 4.52 0 0 1-1.589-1.616c-.385-.665-.594-1.418-.608-2.187v-6.032l-6.85 4.065v6.032c-.013.775.185 1.538.572 2.208a4.25 4.25 0 0 0 1.625 1.595l14.864 8.655c.668.387 1.426.59 2.197.59s1.529-.204 2.197-.59l14.864-8.655c.657-.394 1.204-.95 1.589-1.616s.594-1.418.609-2.187V55.538c.013-.775-.185-1.538-.572-2.208a4.25 4.25 0 0 0-1.625-1.595l-14.993-8.786z" fill="#fff"/><defs><linearGradient id="B" x1="0" y1="0" x2="270" y2="270" gradientUnits="userSpaceOnUse"><stop stop-color="#cb5eee"/><stop offset="1" stop-color="#0cd7e4" stop-opacity=".99"/></linearGradient></defs><text x="32.5" y="231" font-size="27" fill="#fff" filter="url(#A)" font-family="Plus Jakarta Sans,DejaVu Sans,Noto Color Emoji,Apple Color Emoji,sans-serif" font-weight="bold">';
    string svgPartTwo = "</text></svg>";
    uint256 constant priceLenThree = 0.05 ether;
    uint256 constant priceLenFour = 0.03 ether;
    uint256 constant priceDefault = 0.01 ether;
    address payable public owner;

    mapping(string => address) public domains;
    mapping(string => string) public records;
    mapping(uint256 => string) public names;

    Counters.Counter private _tokenIds;

    constructor(string memory __tld)
        payable
        ERC721("Polygon Name Service", "PNS")
    {
        _tld = __tld;
        owner = payable(msg.sender);
    }

    modifier onlyOwner() {
        require(isOwner());
        _;
    }

    error WithdrawalFailed();
    error NameTaken();
    error Unauthorized();
    error AlreadyRegistered();
    error InvalidName(string name);
    error NotEnoughMatic();

    /**
     *  @dev Get all Registred names
     */
    function getAllNames() public view returns (string[] memory) {
        string[] memory allNames = new string[](_tokenIds.current());
        for (uint256 i = 0; i < _tokenIds.current(); i++) {
            allNames[i] = names[i];
        }

        return allNames;
    }

    /**
     * @dev Check if a name is valid
     */
    function valid(string calldata name) public pure returns (bool) {
        return StringUtils.strlen(name) >= 3 && StringUtils.strlen(name) <= 10;
    }

    function isOwner() public view returns (bool) {
        return msg.sender == owner;
    }

    /**
     * @dev With draw funds from the contract
     */
    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Failed to withdraw Matic");
    }

    /**
     * @dev Register a domain name with the name service.
     * @param name The domain name to register.
     */
    function register(string calldata name) public payable {
        if (domains[name] != address(0)) revert AlreadyRegistered();
        if (!valid(name)) revert InvalidName(name);
        uint256 _price = price(name);
        if (msg.value < _price) revert NotEnoughMatic();

        string memory _name = string(abi.encodePacked(name, ".", _tld));
        string memory finalSvg = string(
            abi.encodePacked(svgPartOne, _name, svgPartTwo)
        );
        uint256 newRecordId = _tokenIds.current();
        uint256 length = StringUtils.strlen(name);
        string memory strLen = Strings.toString(length);
        // Create the JSON metadata of our NFT. We do this by combining strings and encoding as base64
        string memory json = Base64.encode(
            abi.encodePacked(
                '{"name": "',
                _name,
                '", "description": "A domain on the Ninja name service", "image": "data:image/svg+xml;base64,',
                Base64.encode(bytes(finalSvg)),
                '","length":"',
                strLen,
                '"}'
            )
        );

        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        _safeMint(msg.sender, newRecordId);
        _setTokenURI(newRecordId, finalTokenUri);
        domains[name] = msg.sender;
        names[_tokenIds.current()] = name;
        _tokenIds.increment();
    }

    /**
     * @dev Get the price of a domain name.
     * @param name The domain name to get the price of.
     * @return price of the domain name.
     */
    function price(string calldata name) public pure returns (uint256) {
        uint256 len = StringUtils.strlen(name);
        if (len < 0) revert InvalidName(name);
        if (len == 3) {
            return priceLenThree;
        } else if (len == 4) {
            return priceLenFour;
        } else {
            return priceDefault;
        }
    }

    /**
     * @dev Get the owner of a domain name.
     * @param name The domain name to get the owner of.
     * @return owner of the domain name.
     */
    function getAddress(string calldata name) public view returns (address) {
        return domains[name];
    }

    /**
     * @dev Set record for a domain name.
     * @param name The domain name to get the owner of.
     * @param record The record to set.
     */
    function setRecord(string calldata name, string calldata record) public {
        // Check that the owner is the transaction sender
        if (msg.sender != domains[name]) revert Unauthorized();
        records[name] = record;
    }

    /**
     * @dev Get record for a domain name.
     * @param name The domain name to get the record of.
     * @return record of the domain name.
     */
    function getRecord(string calldata name)
        public
        view
        returns (string memory)
    {
        return records[name];
    }
}
