import { describe, expect, it, vi } from "vitest";
import { LogoutUseCase } from "./logout.usecase.js";

vi.mock("../../../../shared/utils/crypto.utils.js", () => ({
  hashToken: vi.fn((t: string) => `hashed:${t}`),
}));

import { hashToken } from "../../../../shared/utils/crypto.utils.js";

describe("LogoutUseCase", () => {
  it("ne fait rien si pas de refresh token", async () => {
    const refreshTokenRepository = { revoke: vi.fn() };
    const useCase = new LogoutUseCase(refreshTokenRepository as never);
    await useCase.execute(undefined);
    expect(refreshTokenRepository.revoke).not.toHaveBeenCalled();
    expect(hashToken).not.toHaveBeenCalled();
  });

  it("revoque le token hashé", async () => {
    const refreshTokenRepository = { revoke: vi.fn() };
    const useCase = new LogoutUseCase(refreshTokenRepository as never);
    await useCase.execute("raw-token");
    expect(hashToken).toHaveBeenCalledWith("raw-token");
    expect(refreshTokenRepository.revoke).toHaveBeenCalledWith(
      "hashed:raw-token"
    );
  });
});
