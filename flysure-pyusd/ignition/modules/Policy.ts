import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PolicyModule = buildModule("PolicyModule", (m) => {
  const policy = m.contract("Policy");

  return { policy };
});

export default PolicyModule;

