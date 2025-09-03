import { OIDCRefresh } from "../routes/OIDC";
import { GetUserInfo } from "../routes/User";
import { Skolengo } from "../structures/Skolengo";

export async function LoginWithToken(url: string, refreshToken: string, wellKnown: string, tokenEndpoint: string, emsCode: string): Promise<Skolengo> {
  const tokens = await OIDCRefresh(url, refreshToken);
  return GetUserInfo(
      tokens.access_token,
      tokens.refresh_token,
      wellKnown,
      tokenEndpoint,
      emsCode
  );
}