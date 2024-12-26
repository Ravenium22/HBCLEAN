// filterNFTs.js
import fs from 'fs';

// Read the original data
const rawData = fs.readFileSync('nft-data.json');
const data = JSON.parse(rawData);

// Filter for top 1000
const filteredNFTs = data.nfts
  .filter(nft => nft.officialRank <= 1000)
  .sort((a, b) => a.officialRank - b.officialRank);

// Create new JSON object with filtered data
const newData = {
  nfts: filteredNFTs
};

// Write to new file
fs.writeFileSync(
  'nft-data-top1000.json', 
  JSON.stringify(newData, null, 2)
);

console.log(`Original NFTs: ${data.nfts.length}`);
console.log(`Filtered NFTs: ${filteredNFTs.length}`);
console.log('Saved to nft-data-top1000.json');