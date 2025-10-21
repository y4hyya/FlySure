import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Policy", function () {
  async function deployPolicyFixture() {
    const [owner, policyholder] = await hre.ethers.getSigners();

    const Policy = await hre.ethers.getContractFactory("Policy");
    const policy = await Policy.deploy();

    return { policy, owner, policyholder };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { policy, owner } = await deployPolicyFixture();
      expect(await policy.owner()).to.equal(owner.address);
    });

    it("Should initialize nextPolicyId to 1", async function () {
      const { policy } = await deployPolicyFixture();
      expect(await policy.nextPolicyId()).to.equal(1);
    });
  });

  describe("Policy Creation", function () {
    it("Should create a policy with correct details", async function () {
      const { policy, policyholder } = await deployPolicyFixture();

      const flightNumber = "AA123";
      const departureTime = (await time.latest()) + 86400; // 1 day from now
      const coverageAmount = hre.ethers.parseEther("1.0");
      const premium = hre.ethers.parseEther("0.1");

      await expect(
        policy.connect(policyholder).createPolicy(
          flightNumber,
          departureTime,
          coverageAmount,
          { value: premium }
        )
      ).to.emit(policy, "PolicyCreated")
        .withArgs(1, policyholder.address, flightNumber, departureTime, coverageAmount, premium);

      const createdPolicy = await policy.getPolicy(1);
      expect(createdPolicy.policyholder).to.equal(policyholder.address);
      expect(createdPolicy.flightNumber).to.equal(flightNumber);
      expect(createdPolicy.coverageAmount).to.equal(coverageAmount);
      expect(createdPolicy.isActive).to.equal(true);
      expect(createdPolicy.isClaimed).to.equal(false);
    });

    it("Should fail if premium is 0", async function () {
      const { policy, policyholder } = await deployPolicyFixture();

      const flightNumber = "AA123";
      const departureTime = (await time.latest()) + 86400;
      const coverageAmount = hre.ethers.parseEther("1.0");

      await expect(
        policy.connect(policyholder).createPolicy(
          flightNumber,
          departureTime,
          coverageAmount,
          { value: 0 }
        )
      ).to.be.revertedWith("Premium must be greater than 0");
    });

    it("Should fail if departure time is in the past", async function () {
      const { policy, policyholder } = await deployPolicyFixture();

      const flightNumber = "AA123";
      const departureTime = (await time.latest()) - 86400; // 1 day ago
      const coverageAmount = hre.ethers.parseEther("1.0");
      const premium = hre.ethers.parseEther("0.1");

      await expect(
        policy.connect(policyholder).createPolicy(
          flightNumber,
          departureTime,
          coverageAmount,
          { value: premium }
        )
      ).to.be.revertedWith("Departure time must be in the future");
    });
  });

  describe("Policy Claiming", function () {
    it("Should allow policyholder to claim after departure", async function () {
      const { policy, policyholder } = await deployPolicyFixture();

      const flightNumber = "AA123";
      const departureTime = (await time.latest()) + 3600; // 1 hour from now
      const coverageAmount = hre.ethers.parseEther("1.0");
      const premium = hre.ethers.parseEther("0.1");

      // Create policy
      await policy.connect(policyholder).createPolicy(
        flightNumber,
        departureTime,
        coverageAmount,
        { value: premium }
      );

      // Fund the contract with coverage amount
      await policy.connect(policyholder).createPolicy(
        "BB456",
        departureTime + 86400,
        coverageAmount,
        { value: coverageAmount }
      );

      // Fast forward time to after departure
      await time.increaseTo(departureTime + 1);

      // Claim policy
      await expect(
        policy.connect(policyholder).claimPolicy(1)
      ).to.emit(policy, "PolicyClaimed")
        .withArgs(1, policyholder.address, coverageAmount);

      const claimedPolicy = await policy.getPolicy(1);
      expect(claimedPolicy.isClaimed).to.equal(true);
      expect(claimedPolicy.isActive).to.equal(false);
    });

    it("Should fail if non-policyholder tries to claim", async function () {
      const { policy, owner, policyholder } = await deployPolicyFixture();

      const flightNumber = "AA123";
      const departureTime = (await time.latest()) + 3600;
      const coverageAmount = hre.ethers.parseEther("1.0");
      const premium = hre.ethers.parseEther("0.1");

      await policy.connect(policyholder).createPolicy(
        flightNumber,
        departureTime,
        coverageAmount,
        { value: premium }
      );

      await time.increaseTo(departureTime + 1);

      await expect(
        policy.connect(owner).claimPolicy(1)
      ).to.be.revertedWith("Not the policyholder");
    });
  });

  describe("Withdrawal", function () {
    it("Should allow owner to withdraw funds", async function () {
      const { policy, owner, policyholder } = await deployPolicyFixture();

      const premium = hre.ethers.parseEther("0.1");

      await policy.connect(policyholder).createPolicy(
        "AA123",
        (await time.latest()) + 86400,
        hre.ethers.parseEther("1.0"),
        { value: premium }
      );

      const balanceBefore = await hre.ethers.provider.getBalance(owner.address);
      const tx = await policy.connect(owner).withdraw();
      const receipt = await tx.wait();
      const gasCost = receipt!.gasUsed * receipt!.gasPrice;

      const balanceAfter = await hre.ethers.provider.getBalance(owner.address);
      expect(balanceAfter).to.equal(balanceBefore + premium - gasCost);
    });

    it("Should fail if non-owner tries to withdraw", async function () {
      const { policy, policyholder } = await deployPolicyFixture();

      await expect(
        policy.connect(policyholder).withdraw()
      ).to.be.revertedWithCustomError(policy, "OwnableUnauthorizedAccount");
    });
  });
});

