import { expect } from "chai";
import hre from "hardhat";

describe("PolicyNFT", function () {
  async function deployPolicyNFTFixture() {
    const [owner, user1, user2] = await hre.ethers.getSigners();

    const PolicyNFT = await hre.ethers.getContractFactory("PolicyNFT");
    const policyNFT = await PolicyNFT.deploy(owner.address);

    return { policyNFT, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { policyNFT, owner } = await deployPolicyNFTFixture();
      expect(await policyNFT.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      const { policyNFT } = await deployPolicyNFTFixture();
      expect(await policyNFT.name()).to.equal("FlySure Policy");
      expect(await policyNFT.symbol()).to.equal("FLYP");
    });

    it("Should initialize with token counter at 0", async function () {
      const { policyNFT } = await deployPolicyNFTFixture();
      expect(await policyNFT.totalSupply()).to.equal(0);
    });
  });

  describe("Policy NFT Minting", function () {
    it("Should mint a policy NFT successfully", async function () {
      const { policyNFT, owner, user1 } = await deployPolicyNFTFixture();

      const flightNumber = "TK1234";
      const premiumAmount = hre.ethers.parseUnits("10", 6);
      const payoutAmount = hre.ethers.parseUnits("100", 6);
      const departureTimestamp = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
      const policyId = 1;

      const tx = await policyNFT.connect(owner).mintPolicy(
        user1.address,
        flightNumber,
        premiumAmount,
        payoutAmount,
        departureTimestamp,
        policyId
      );

      await tx.wait();

      // Check token ownership
      expect(await policyNFT.ownerOf(policyId)).to.equal(user1.address);
      
      // Check token URI (expecting dynamic URI with policy ID)
      const tokenURI = await policyNFT.tokenURI(policyId);
      expect(tokenURI).to.include(".json");
      expect(tokenURI).to.include("https://api.flysure.com/metadata/");
      
      // Check policy details
      const policyDetails = await policyNFT.getPolicyDetails(policyId);
      expect(policyDetails.flightNumber).to.equal(flightNumber);
      expect(policyDetails.premiumAmount).to.equal(premiumAmount);
      expect(policyDetails.payoutAmount).to.equal(payoutAmount);
      expect(policyDetails.departureTimestamp).to.equal(departureTimestamp);
      expect(policyDetails.status).to.equal(0); // PolicyStatus.Active
      
      // Check policy status
      expect(await policyNFT.getPolicyStatus(policyId)).to.equal(0); // PolicyStatus.Active
    });

    it("Should fail if non-owner tries to mint", async function () {
      const { policyNFT, user1 } = await deployPolicyNFTFixture();

      await expect(
        policyNFT.connect(user1).mintPolicy(
          user1.address,
          "TK1234",
          hre.ethers.parseUnits("10", 6),
          hre.ethers.parseUnits("100", 6),
          Math.floor(Date.now() / 1000) + 86400,
          1
        )
      ).to.be.revertedWithCustomError(policyNFT, "OwnableUnauthorizedAccount");
    });
  });

  describe("Policy Status Updates", function () {
    it("Should update policy status successfully", async function () {
      const { policyNFT, owner, user1 } = await deployPolicyNFTFixture();

      // Mint a policy NFT first
      await policyNFT.connect(owner).mintPolicy(
        user1.address,
        "TK1234",
        hre.ethers.parseUnits("10", 6),
        hre.ethers.parseUnits("100", 6),
        Math.floor(Date.now() / 1000) + 86400,
        1
      );

      // Update status to Claimable
      const tx = await policyNFT.connect(owner).updatePolicyStatus(1, 1); // PolicyStatus.Claimable
      await tx.wait();

      const policyDetails = await policyNFT.getPolicyDetails(1);
      expect(policyDetails.status).to.equal(1); // PolicyStatus.Claimable
      
      // Check policy status getter
      expect(await policyNFT.getPolicyStatus(1)).to.equal(1); // PolicyStatus.Claimable
    });

    it("Should fail if non-owner tries to update status", async function () {
      const { policyNFT, owner, user1 } = await deployPolicyNFTFixture();

      // Mint a policy NFT first
      await policyNFT.connect(owner).mintPolicy(
        user1.address,
        "TK1234",
        hre.ethers.parseUnits("10", 6),
        hre.ethers.parseUnits("100", 6),
        Math.floor(Date.now() / 1000) + 86400,
        1
      );

      // Try to update status as non-owner
      await expect(
        policyNFT.connect(user1).updatePolicyStatus(1, 1)
      ).to.be.revertedWithCustomError(policyNFT, "OwnableUnauthorizedAccount");
    });
  });

  describe("Policy NFT Burning", function () {
    it("Should burn a policy NFT successfully", async function () {
      const { policyNFT, owner, user1 } = await deployPolicyNFTFixture();

      // Mint a policy NFT first
      await policyNFT.connect(owner).mintPolicy(
        user1.address,
        "TK1234",
        hre.ethers.parseUnits("10", 6),
        hre.ethers.parseUnits("100", 6),
        Math.floor(Date.now() / 1000) + 86400,
        1
      );

      // Burn the NFT
      const tx = await policyNFT.connect(owner).burnPolicy(1);
      await tx.wait();

      // Check that token no longer exists
      await expect(policyNFT.ownerOf(1)).to.be.revertedWithCustomError(
        policyNFT,
        "ERC721NonexistentToken"
      );

      // Check that policy details are cleared
      await expect(policyNFT.getPolicyDetails(1)).to.be.revertedWith("Token does not exist");
      
      // Check that policy status getter fails
      await expect(policyNFT.getPolicyStatus(1)).to.be.revertedWith("Token does not exist");
    });

    it("Should fail if non-owner tries to burn", async function () {
      const { policyNFT, owner, user1 } = await deployPolicyNFTFixture();

      // Mint a policy NFT first
      await policyNFT.connect(owner).mintPolicy(
        user1.address,
        "TK1234",
        hre.ethers.parseUnits("10", 6),
        hre.ethers.parseUnits("100", 6),
        Math.floor(Date.now() / 1000) + 86400,
        1
      );

      // Try to burn as non-owner
      await expect(
        policyNFT.connect(user1).burnPolicy(1)
      ).to.be.revertedWithCustomError(policyNFT, "OwnableUnauthorizedAccount");
    });
  });

  describe("Base URI Management", function () {
    it("Should set base URI successfully", async function () {
      const { policyNFT, owner } = await deployPolicyNFTFixture();

      const newBaseURI = "https://newapi.flysure.com/metadata/";
      await policyNFT.connect(owner).setBaseURI(newBaseURI);

      // Mint a token to test base URI
      await policyNFT.connect(owner).mintPolicy(
        owner.address,
        "TK1234",
        hre.ethers.parseUnits("10", 6),
        hre.ethers.parseUnits("100", 6),
        Math.floor(Date.now() / 1000) + 86400,
        1
      );

      // Check token URI (expecting dynamic URI with policy ID)
      const tokenURI = await policyNFT.tokenURI(1);
      expect(tokenURI).to.include(".json");
      expect(tokenURI).to.include(newBaseURI);
    });

    it("Should fail if non-owner tries to set base URI", async function () {
      const { policyNFT, user1 } = await deployPolicyNFTFixture();

      await expect(
        policyNFT.connect(user1).setBaseURI("https://newapi.flysure.com/metadata/")
      ).to.be.revertedWithCustomError(policyNFT, "OwnableUnauthorizedAccount");
    });
  });
});
