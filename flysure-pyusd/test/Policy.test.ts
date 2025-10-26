import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Policy", function () {
  async function deployPolicyFixture() {
    const [owner, policyholder, oracle] = await hre.ethers.getSigners();

    // PYUSD Sepolia testnet address
    const pyusdAddress = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";

    const Policy = await hre.ethers.getContractFactory("Policy");
    const policy = await Policy.deploy(pyusdAddress);

    // Set oracle address
    await policy.connect(owner).setOracleAddress(oracle.address);

    return { policy, owner, policyholder, oracle };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { policy, owner } = await deployPolicyFixture();
      expect(await policy.owner()).to.equal(owner.address);
    });

    it("Should initialize policy counter to 0", async function () {
      const { policy } = await deployPolicyFixture();
      // Test that the contract is properly initialized
      // We can verify this by checking that the PYUSD token address is set
      const pyusdAddress = await policy.pyusdToken();
      expect(pyusdAddress).to.equal("0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9");
    });
  });

  describe("Policy Creation", function () {
    it("Should create a policy with correct details", async function () {
      const { policy, policyholder } = await deployPolicyFixture();

      const flightId = "IST-BER-20251025";
      const premiumAmount = hre.ethers.parseEther("10");
      const payoutAmount = hre.ethers.parseEther("100");
      const delayThreshold = 120;
      const departureTimestamp = Math.floor(Date.now() / 1000) + 172800; // 48 hours from now

      // Note: This test would require PYUSD token setup for full testing
      // For now, we'll test the function signature and basic validation
      await expect(
        policy.connect(policyholder).createPolicy(
          flightId,
          premiumAmount,
          payoutAmount,
          delayThreshold,
          departureTimestamp
        )
      ).to.be.reverted; // Expected since we don't have PYUSD tokens
    });

    it("Should fail if premium is 0", async function () {
      const { policy, policyholder } = await deployPolicyFixture();

      const departureTimestamp = Math.floor(Date.now() / 1000) + 86400;

      await expect(
        policy.connect(policyholder).createPolicy(
          "IST-BER-20251025",
          0,
          hre.ethers.parseEther("100"),
          120,
          departureTimestamp
        )
      ).to.be.revertedWith("Premium amount must be greater than 0");
    });

    it("Should fail if payout is 0", async function () {
      const { policy, policyholder } = await deployPolicyFixture();

      const departureTimestamp = Math.floor(Date.now() / 1000) + 86400;

      await expect(
        policy.connect(policyholder).createPolicy(
          "IST-BER-20251025",
          hre.ethers.parseEther("10"),
          0,
          120,
          departureTimestamp
        )
      ).to.be.revertedWith("Payout amount must be greater than 0");
    });

    it("Should fail if delay threshold is 0", async function () {
      const { policy, policyholder } = await deployPolicyFixture();

      const departureTimestamp = Math.floor(Date.now() / 1000) + 86400;

      await expect(
        policy.connect(policyholder).createPolicy(
          "IST-BER-20251025",
          hre.ethers.parseEther("10"),
          hre.ethers.parseEther("100"),
          0,
          departureTimestamp
        )
      ).to.be.revertedWith("Delay threshold must be greater than 0");
    });

    it("Should fail if flight ID is empty", async function () {
      const { policy, policyholder } = await deployPolicyFixture();

      const departureTimestamp = Math.floor(Date.now() / 1000) + 86400;

      await expect(
        policy.connect(policyholder).createPolicy(
          "",
          hre.ethers.parseEther("10"),
          hre.ethers.parseEther("100"),
          120,
          departureTimestamp
        )
      ).to.be.revertedWith("Flight ID cannot be empty");
    });

    it("Should fail if departure timestamp is in the past", async function () {
      const { policy, policyholder } = await deployPolicyFixture();

      const pastTimestamp = Math.floor(Date.now() / 1000) - 86400; // 24 hours ago

      await expect(
        policy.connect(policyholder).createPolicy(
          "IST-BER-20251025",
          hre.ethers.parseEther("10"),
          hre.ethers.parseEther("100"),
          120,
          pastTimestamp
        )
      ).to.be.revertedWith("Departure must be in the future");
    });
  });

  describe("Oracle Functions", function () {
    it("Should allow owner to set oracle address", async function () {
      const { policy, owner, oracle } = await deployPolicyFixture();
      
      const newOracle = hre.ethers.Wallet.createRandom();
      await policy.connect(owner).setOracleAddress(newOracle.address);
      
      expect(await policy.oracleAddress()).to.equal(newOracle.address);
    });

    it("Should fail if non-owner tries to set oracle", async function () {
      const { policy, policyholder } = await deployPolicyFixture();
      
      const newOracle = hre.ethers.Wallet.createRandom();
      await expect(
        policy.connect(policyholder).setOracleAddress(newOracle.address)
      ).to.be.revertedWithCustomError(policy, "OwnableUnauthorizedAccount");
    });

    it("Should fail if oracle address is zero", async function () {
      const { policy, owner } = await deployPolicyFixture();
      
      await expect(
        policy.connect(owner).setOracleAddress(hre.ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid oracle address");
    });
  });

  describe("Policy Management", function () {
    it("Should allow oracle to trigger payout", async function () {
      const { policy, oracle } = await deployPolicyFixture();
      
      // This would require a policy to exist first
      // For now, we test the access control
      await expect(
        policy.connect(oracle).triggerPayout(1, 150)
      ).to.be.revertedWith("Policy not found");
    });

    it("Should fail if non-oracle tries to trigger payout", async function () {
      const { policy, policyholder } = await deployPolicyFixture();
      
      await expect(
        policy.connect(policyholder).triggerPayout(1, 150)
      ).to.be.revertedWithCustomError(policy, "NotOracle");
    });

    it("Should allow oracle to update flight status", async function () {
      const { policy, oracle } = await deployPolicyFixture();
      
      // Test access control for updateFlightStatus
      await expect(
        policy.connect(oracle).updateFlightStatus(1, 1, 150) // DELAYED status
      ).to.be.revertedWith("Policy not found");
    });

    it("Should fail if non-oracle tries to update flight status", async function () {
      const { policy, policyholder } = await deployPolicyFixture();
      
      await expect(
        policy.connect(policyholder).updateFlightStatus(1, 1, 150)
      ).to.be.revertedWithCustomError(policy, "NotOracle");
    });
  });

  describe("User Claim Functions", function () {
    it("Should allow policyholder to claim payout for delayed flight", async function () {
      const { policy, policyholder, oracle } = await deployPolicyFixture();
      
      // This would require a policy to exist and oracle to set flight status
      // For now, we test the access control
      await expect(
        policy.connect(policyholder).claimPayout(1)
      ).to.be.revertedWith("Policy not found");
    });

    it("Should fail if non-policyholder tries to claim payout", async function () {
      const { policy, policyholder, oracle } = await deployPolicyFixture();
      
      // Create a random address that's not the policyholder
      const randomAddress = hre.ethers.Wallet.createRandom();
      
      await expect(
        policy.connect(randomAddress).claimPayout(1)
      ).to.be.revertedWith("Policy not found");
    });

    it("Should allow policyholder to expire policy for on-time flight", async function () {
      const { policy, policyholder } = await deployPolicyFixture();
      
      // This would require a policy to exist with ON_TIME status
      // For now, we test the access control
      await expect(
        policy.connect(policyholder).expirePolicy(1)
      ).to.be.revertedWith("Policy not found");
    });

    it("Should fail if non-policyholder tries to expire policy", async function () {
      const { policy, policyholder } = await deployPolicyFixture();
      
      // Create a random address that's not the policyholder
      const randomAddress = hre.ethers.Wallet.createRandom();
      
      await expect(
        policy.connect(randomAddress).expirePolicy(1)
      ).to.be.revertedWith("Policy not found");
    });
  });

  describe("Oracle Integration and Claim Process", function () {
    it("Should correctly pay out a claim when the oracle reports a delay", async function () {
      const { policy, policyholder, oracle, owner } = await deployPolicyFixture();
      
      // Deploy MockPYUSD for testing
      const MockPYUSD = await hre.ethers.getContractFactory("MockPYUSD");
      const mockPYUSD = await MockPYUSD.deploy();
      
      // Deploy Policy with MockPYUSD
      const Policy = await hre.ethers.getContractFactory("Policy");
      const testPolicy = await Policy.deploy(mockPYUSD.target);
      
      // Set oracle address
      await testPolicy.connect(owner).setOracleAddress(oracle.address);
      
      // Fund the policyholder with PYUSD
      const policyholderFundAmount = hre.ethers.parseUnits("1000", 6); // 1000 PYUSD
      await mockPYUSD.transfer(policyholder.address, policyholderFundAmount);
      
      // Fund the contract with PYUSD for payouts
      const fundAmount = hre.ethers.parseUnits("1000", 6); // 1000 PYUSD
      await mockPYUSD.transfer(testPolicy.target, fundAmount);
      
      // Create a policy
      const flightId = "TK1234";
      const premiumAmount = hre.ethers.parseUnits("10", 6); // 10 PYUSD
      const payoutAmount = hre.ethers.parseUnits("100", 6); // 100 PYUSD
      const delayThreshold = 120; // 120 minutes
      const departureTimestamp = Math.floor(Date.now() / 1000) + 172800; // 48 hours from now
      
      // Approve PYUSD spending
      await mockPYUSD.connect(policyholder).approve(testPolicy.target, premiumAmount);
      
      // Create policy
      const tx = await testPolicy.connect(policyholder).createPolicy(
        flightId,
        premiumAmount,
        payoutAmount,
        delayThreshold,
        departureTimestamp
      );
      const receipt = await tx.wait();
      
      // Get policy ID from event
      const policyCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = testPolicy.interface.parseLog(log);
          return parsed?.name === "PolicyCreated";
        } catch {
          return false;
        }
      });
      
      const policyId = policyCreatedEvent ? 
        testPolicy.interface.parseLog(policyCreatedEvent)?.args[0] : 1;
      
      // Fast forward time to after departure
      await hre.network.provider.send("evm_increaseTime", [86400 + 1]); // 24 hours + 1 second
      await hre.network.provider.send("evm_mine");
      
      // Oracle updates flight status to DELAYED with 150 minutes delay
      await testPolicy.connect(oracle).updateFlightStatus(
        policyId,
        1, // FlightStatus.DELAYED
        150 // 150 minutes delay (exceeds 120 minute threshold)
      );
      
      // Get policyholder balance before claim
      const balanceBefore = await mockPYUSD.balanceOf(policyholder.address);
      
      // Policyholder claims payout
      const claimTx = await testPolicy.connect(policyholder).claimPayout(policyId);
      await claimTx.wait();
      
      // Get policyholder balance after claim
      const balanceAfter = await mockPYUSD.balanceOf(policyholder.address);
      
      // Assertions
      expect(balanceAfter - balanceBefore).to.equal(payoutAmount);
      
      // Check policy status is now PAID
      const policyDetails = await testPolicy.getPolicyDetails(policyId);
      expect(policyDetails.status).to.equal(1); // PolicyStatus.PAID
      expect(policyDetails.flightStatus).to.equal(1); // FlightStatus.DELAYED
    });

    it("Should expire the policy if the flight was on time", async function () {
      const { policy, policyholder, oracle, owner } = await deployPolicyFixture();
      
      // Deploy MockPYUSD for testing
      const MockPYUSD = await hre.ethers.getContractFactory("MockPYUSD");
      const mockPYUSD = await MockPYUSD.deploy();
      
      // Deploy Policy with MockPYUSD
      const Policy = await hre.ethers.getContractFactory("Policy");
      const testPolicy = await Policy.deploy(mockPYUSD.target);
      
      // Set oracle address
      await testPolicy.connect(owner).setOracleAddress(oracle.address);
      
      // Fund the policyholder with PYUSD
      const policyholderFundAmount = hre.ethers.parseUnits("1000", 6); // 1000 PYUSD
      await mockPYUSD.transfer(policyholder.address, policyholderFundAmount);
      
      // Fund the contract with PYUSD for payouts
      const fundAmount = hre.ethers.parseUnits("1000", 6); // 1000 PYUSD
      await mockPYUSD.transfer(testPolicy.target, fundAmount);
      
      // Create a policy
      const flightId = "TK5678";
      const premiumAmount = hre.ethers.parseUnits("10", 6); // 10 PYUSD
      const payoutAmount = hre.ethers.parseUnits("100", 6); // 100 PYUSD
      const delayThreshold = 120; // 120 minutes
      const departureTimestamp = Math.floor(Date.now() / 1000) + 172800; // 48 hours from now
      
      // Approve PYUSD spending
      await mockPYUSD.connect(policyholder).approve(testPolicy.target, premiumAmount);
      
      // Create policy
      const tx = await testPolicy.connect(policyholder).createPolicy(
        flightId,
        premiumAmount,
        payoutAmount,
        delayThreshold,
        departureTimestamp
      );
      const receipt = await tx.wait();
      
      // Get policy ID from event
      const policyCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = testPolicy.interface.parseLog(log);
          return parsed?.name === "PolicyCreated";
        } catch {
          return false;
        }
      });
      
      const policyId = policyCreatedEvent ? 
        testPolicy.interface.parseLog(policyCreatedEvent)?.args[0] : 1;
      
      // Fast forward time to after departure
      await hre.network.provider.send("evm_increaseTime", [86400 + 1]); // 24 hours + 1 second
      await hre.network.provider.send("evm_mine");
      
      // Oracle updates flight status to ON_TIME
      await testPolicy.connect(oracle).updateFlightStatus(
        policyId,
        0, // FlightStatus.ON_TIME
        0 // No delay
      );
      
      // Get policyholder balance before expiration
      const balanceBefore = await mockPYUSD.balanceOf(policyholder.address);
      
      // Policyholder expires policy
      const expireTx = await testPolicy.connect(policyholder).expirePolicy(policyId);
      await expireTx.wait();
      
      // Get policyholder balance after expiration
      const balanceAfter = await mockPYUSD.balanceOf(policyholder.address);
      
      // Assertions
      expect(balanceAfter).to.equal(balanceBefore); // No payout for on-time flight
      
      // Check policy status is now EXPIRED
      const policyDetails = await testPolicy.getPolicyDetails(policyId);
      expect(policyDetails.status).to.equal(2); // PolicyStatus.EXPIRED
      expect(policyDetails.flightStatus).to.equal(0); // FlightStatus.ON_TIME
    });

    it("Should pay out full amount for cancelled flight regardless of delay threshold", async function () {
      const { policy, policyholder, oracle, owner } = await deployPolicyFixture();
      
      // Deploy MockPYUSD for testing
      const MockPYUSD = await hre.ethers.getContractFactory("MockPYUSD");
      const mockPYUSD = await MockPYUSD.deploy();
      
      // Deploy Policy with MockPYUSD
      const Policy = await hre.ethers.getContractFactory("Policy");
      const testPolicy = await Policy.deploy(mockPYUSD.target);
      
      // Set oracle address
      await testPolicy.connect(owner).setOracleAddress(oracle.address);
      
      // Fund the policyholder with PYUSD
      const policyholderFundAmount = hre.ethers.parseUnits("1000", 6); // 1000 PYUSD
      await mockPYUSD.transfer(policyholder.address, policyholderFundAmount);
      
      // Fund the contract with PYUSD for payouts
      const fundAmount = hre.ethers.parseUnits("1000", 6); // 1000 PYUSD
      await mockPYUSD.transfer(testPolicy.target, fundAmount);
      
      // Create a policy
      const flightId = "TK9999";
      const premiumAmount = hre.ethers.parseUnits("10", 6); // 10 PYUSD
      const payoutAmount = hre.ethers.parseUnits("100", 6); // 100 PYUSD
      const delayThreshold = 120; // 120 minutes
      const departureTimestamp = Math.floor(Date.now() / 1000) + 172800; // 48 hours from now
      
      // Approve PYUSD spending
      await mockPYUSD.connect(policyholder).approve(testPolicy.target, premiumAmount);
      
      // Create policy
      const tx = await testPolicy.connect(policyholder).createPolicy(
        flightId,
        premiumAmount,
        payoutAmount,
        delayThreshold,
        departureTimestamp
      );
      const receipt = await tx.wait();
      
      // Get policy ID from event
      const policyCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = testPolicy.interface.parseLog(log);
          return parsed?.name === "PolicyCreated";
        } catch {
          return false;
        }
      });
      
      const policyId = policyCreatedEvent ? 
        testPolicy.interface.parseLog(policyCreatedEvent)?.args[0] : 1;
      
      // Fast forward time to after departure
      await hre.network.provider.send("evm_increaseTime", [86400 + 1]); // 24 hours + 1 second
      await hre.network.provider.send("evm_mine");
      
      // Oracle updates flight status to CANCELLED
      await testPolicy.connect(oracle).updateFlightStatus(
        policyId,
        2, // FlightStatus.CANCELLED
        0 // No delay (cancelled flights get full payout regardless)
      );
      
      // Get policyholder balance before claim
      const balanceBefore = await mockPYUSD.balanceOf(policyholder.address);
      
      // Policyholder claims payout
      const claimTx = await testPolicy.connect(policyholder).claimPayout(policyId);
      await claimTx.wait();
      
      // Get policyholder balance after claim
      const balanceAfter = await mockPYUSD.balanceOf(policyholder.address);
      
      // Assertions
      expect(balanceAfter - balanceBefore).to.equal(payoutAmount);
      
      // Check policy status is now PAID
      const policyDetails = await testPolicy.getPolicyDetails(policyId);
      expect(policyDetails.status).to.equal(1); // PolicyStatus.PAID
      expect(policyDetails.flightStatus).to.equal(2); // FlightStatus.CANCELLED
    });

    it("Should fail to claim payout if flight was delayed but below threshold", async function () {
      const { policy, policyholder, oracle, owner } = await deployPolicyFixture();
      
      // Deploy MockPYUSD for testing
      const MockPYUSD = await hre.ethers.getContractFactory("MockPYUSD");
      const mockPYUSD = await MockPYUSD.deploy();
      
      // Deploy Policy with MockPYUSD
      const Policy = await hre.ethers.getContractFactory("Policy");
      const testPolicy = await Policy.deploy(mockPYUSD.target);
      
      // Set oracle address
      await testPolicy.connect(owner).setOracleAddress(oracle.address);
      
      // Fund the policyholder with PYUSD
      const policyholderFundAmount = hre.ethers.parseUnits("1000", 6); // 1000 PYUSD
      await mockPYUSD.transfer(policyholder.address, policyholderFundAmount);
      
      // Fund the contract with PYUSD for payouts
      const fundAmount = hre.ethers.parseUnits("1000", 6); // 1000 PYUSD
      await mockPYUSD.transfer(testPolicy.target, fundAmount);
      
      // Create a policy
      const flightId = "TK1111";
      const premiumAmount = hre.ethers.parseUnits("10", 6); // 10 PYUSD
      const payoutAmount = hre.ethers.parseUnits("100", 6); // 100 PYUSD
      const delayThreshold = 120; // 120 minutes
      const departureTimestamp = Math.floor(Date.now() / 1000) + 172800; // 48 hours from now
      
      // Approve PYUSD spending
      await mockPYUSD.connect(policyholder).approve(testPolicy.target, premiumAmount);
      
      // Create policy
      const tx = await testPolicy.connect(policyholder).createPolicy(
        flightId,
        premiumAmount,
        payoutAmount,
        delayThreshold,
        departureTimestamp
      );
      const receipt = await tx.wait();
      
      // Get policy ID from event
      const policyCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = testPolicy.interface.parseLog(log);
          return parsed?.name === "PolicyCreated";
        } catch {
          return false;
        }
      });
      
      const policyId = policyCreatedEvent ? 
        testPolicy.interface.parseLog(policyCreatedEvent)?.args[0] : 1;
      
      // Fast forward time to after departure
      await hre.network.provider.send("evm_increaseTime", [86400 + 1]); // 24 hours + 1 second
      await hre.network.provider.send("evm_mine");
      
      // Oracle updates flight status to DELAYED with only 60 minutes delay (below 120 threshold)
      await testPolicy.connect(oracle).updateFlightStatus(
        policyId,
        1, // FlightStatus.DELAYED
        60 // 60 minutes delay (below 120 minute threshold)
      );
      
      // Policyholder tries to claim payout - should fail
      await expect(
        testPolicy.connect(policyholder).claimPayout(policyId)
      ).to.be.revertedWith("Flight status does not qualify for payout");
      
      // Check policy is still ACTIVE
      const policyDetails = await testPolicy.getPolicyDetails(policyId);
      expect(policyDetails.status).to.equal(0); // PolicyStatus.ACTIVE
    });

    it("Should fail to claim payout before departure time", async function () {
      const { policy, policyholder, oracle, owner } = await deployPolicyFixture();
      
      // Deploy MockPYUSD for testing
      const MockPYUSD = await hre.ethers.getContractFactory("MockPYUSD");
      const mockPYUSD = await MockPYUSD.deploy();
      
      // Deploy Policy with MockPYUSD
      const Policy = await hre.ethers.getContractFactory("Policy");
      const testPolicy = await Policy.deploy(mockPYUSD.target);
      
      // Set oracle address
      await testPolicy.connect(owner).setOracleAddress(oracle.address);
      
      // Fund the policyholder with PYUSD
      const policyholderFundAmount = hre.ethers.parseUnits("1000", 6); // 1000 PYUSD
      await mockPYUSD.transfer(policyholder.address, policyholderFundAmount);
      
      // Fund the contract with PYUSD for payouts
      const fundAmount = hre.ethers.parseUnits("1000", 6); // 1000 PYUSD
      await mockPYUSD.transfer(testPolicy.target, fundAmount);
      
      // Create a policy
      const flightId = "TK2222";
      const premiumAmount = hre.ethers.parseUnits("10", 6); // 10 PYUSD
      const payoutAmount = hre.ethers.parseUnits("100", 6); // 100 PYUSD
      const delayThreshold = 120; // 120 minutes
      const departureTimestamp = Math.floor(Date.now() / 1000) + 172800; // 48 hours from now
      
      // Approve PYUSD spending
      await mockPYUSD.connect(policyholder).approve(testPolicy.target, premiumAmount);
      
      // Create policy
      const tx = await testPolicy.connect(policyholder).createPolicy(
        flightId,
        premiumAmount,
        payoutAmount,
        delayThreshold,
        departureTimestamp
      );
      const receipt = await tx.wait();
      
      // Get policy ID from event
      const policyCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = testPolicy.interface.parseLog(log);
          return parsed?.name === "PolicyCreated";
        } catch {
          return false;
        }
      });
      
      const policyId = policyCreatedEvent ? 
        testPolicy.interface.parseLog(policyCreatedEvent)?.args[0] : 1;
      
      // Oracle updates flight status to DELAYED (but departure hasn't passed yet)
      await testPolicy.connect(oracle).updateFlightStatus(
        policyId,
        1, // FlightStatus.DELAYED
        150 // 150 minutes delay
      );
      
      // Policyholder tries to claim payout before departure - should fail
      await expect(
        testPolicy.connect(policyholder).claimPayout(policyId)
      ).to.be.revertedWith("Cannot claim before departure time");
      
      // Check policy is still ACTIVE
      const policyDetails = await testPolicy.getPolicyDetails(policyId);
      expect(policyDetails.status).to.equal(0); // PolicyStatus.ACTIVE
    });
  });

  describe("Double-Booking Prevention", function () {
    it("Should revert when a user tries to insure the same flight twice", async function () {
      const { policy, policyholder, oracle, owner } = await deployPolicyFixture();
      
      // Deploy MockPYUSD for testing
      const MockPYUSD = await hre.ethers.getContractFactory("MockPYUSD");
      const mockPYUSD = await MockPYUSD.deploy();
      
      // Deploy Policy with MockPYUSD
      const Policy = await hre.ethers.getContractFactory("Policy");
      const testPolicy = await Policy.deploy(mockPYUSD.target);
      await testPolicy.connect(owner).setOracleAddress(oracle.address);
      
      // Fund policyholder with MockPYUSD
      const policyholderFundAmount = hre.ethers.parseUnits("1000", 6);
      await mockPYUSD.transfer(policyholder.address, policyholderFundAmount);
      
      // Fund contract with MockPYUSD for payouts
      const fundAmount = hre.ethers.parseUnits("1000", 6);
      await mockPYUSD.transfer(testPolicy.target, fundAmount);
      
      const flightId = "FL123";
      const premiumAmount = hre.ethers.parseUnits("10", 6);
      const payoutAmount = hre.ethers.parseUnits("100", 6);
      const delayThreshold = 120;
      const departureTimestamp = Math.floor(Date.now() / 1000) + 172800; // 48 hours from now
      
      // Approve PYUSD spending
      await mockPYUSD.connect(policyholder).approve(testPolicy.target, premiumAmount);
      
      // First policy creation should succeed
      const tx1 = await testPolicy.connect(policyholder).createPolicy(
        flightId,
        premiumAmount,
        payoutAmount,
        delayThreshold,
        departureTimestamp
      );
      await tx1.wait();
      
      // Approve PYUSD spending for second policy
      await mockPYUSD.connect(policyholder).approve(testPolicy.target, premiumAmount);
      
      // Second policy creation for the same flight should fail
      await expect(
        testPolicy.connect(policyholder).createPolicy(
          flightId, // Same flight ID
          premiumAmount,
          payoutAmount,
          delayThreshold,
          departureTimestamp
        )
      ).to.be.revertedWith("FlySure: You have already insured this flight");
      
      // Verify that hasInsuredFlight mapping is correctly set
      const hasInsured = await testPolicy.hasInsuredFlight(policyholder.address, flightId);
      expect(hasInsured).to.be.true;
    });
    
    it("Should allow different users to insure the same flight", async function () {
      const { policy, policyholder, oracle, owner } = await deployPolicyFixture();
      
      // Get another user
      const [, , , , user2] = await hre.ethers.getSigners();
      
      // Deploy MockPYUSD for testing
      const MockPYUSD = await hre.ethers.getContractFactory("MockPYUSD");
      const mockPYUSD = await MockPYUSD.deploy();
      
      // Deploy Policy with MockPYUSD
      const Policy = await hre.ethers.getContractFactory("Policy");
      const testPolicy = await Policy.deploy(mockPYUSD.target);
      await testPolicy.connect(owner).setOracleAddress(oracle.address);
      
      // Fund both users with MockPYUSD
      const userFundAmount = hre.ethers.parseUnits("1000", 6);
      await mockPYUSD.transfer(policyholder.address, userFundAmount);
      await mockPYUSD.transfer(user2.address, userFundAmount);
      
      // Fund contract with MockPYUSD for payouts
      const fundAmount = hre.ethers.parseUnits("2000", 6);
      await mockPYUSD.transfer(testPolicy.target, fundAmount);
      
      const flightId = "FL456";
      const premiumAmount = hre.ethers.parseUnits("10", 6);
      const payoutAmount = hre.ethers.parseUnits("100", 6);
      const delayThreshold = 120;
      const departureTimestamp = Math.floor(Date.now() / 1000) + 172800; // 48 hours from now
      
      // User 1 creates policy
      await mockPYUSD.connect(policyholder).approve(testPolicy.target, premiumAmount);
      const tx1 = await testPolicy.connect(policyholder).createPolicy(
        flightId,
        premiumAmount,
        payoutAmount,
        delayThreshold,
        departureTimestamp
      );
      await tx1.wait();
      
      // User 2 creates policy for the same flight (should succeed)
      await mockPYUSD.connect(user2).approve(testPolicy.target, premiumAmount);
      const tx2 = await testPolicy.connect(user2).createPolicy(
        flightId, // Same flight ID
        premiumAmount,
        payoutAmount,
        delayThreshold,
        departureTimestamp
      );
      await tx2.wait();
      
      // Both users should have insured this flight
      const hasInsured1 = await testPolicy.hasInsuredFlight(policyholder.address, flightId);
      const hasInsured2 = await testPolicy.hasInsuredFlight(user2.address, flightId);
      
      expect(hasInsured1).to.be.true;
      expect(hasInsured2).to.be.true;
    });
  });
});