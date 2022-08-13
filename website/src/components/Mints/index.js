import React from "react";
import { DomainsContract } from "../../contracts/DomainsContract";
import { connect } from "../../state";

function Mints(props) {
  const tld = ".matic";
  const { mints, currentAccount, editRecord } = props;

  if (mints.length > 0) {
    return (
      <div className="mint-container">
        <p className="subtitle"> Recently minted domains</p>
        <div className="mint-list">
          {mints.map((mint, index) => {
            return (
              <div className="mint-item" key={index}>
                <div className="mint-row">
                  <a
                    className="link"
                    href={`https://testnets.opensea.io/assets/mumbai/${DomainsContract.address}/${mint.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <p className="underlined">
                      {" "}
                      {mint.name}
                      {tld}{" "}
                    </p>
                  </a>
                  {/* If mint.owner is currentAccount, add an "edit" button*/}
                  {currentAccount &&
                  mint.owner.toLowerCase() === currentAccount.toLowerCase() ? (
                    <button
                      className="edit-button"
                      onClick={() => editRecord(mint.name)}
                    >
                      <img
                        className="edit-icon"
                        src="https://img.icons8.com/metro/26/000000/pencil.png"
                        alt="Edit button"
                      />
                    </button>
                  ) : null}
                </div>
                <p> {mint.record} </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return <p className="subtitle"></p>;
}

export default connect(Mints);
