import { OIDCRefresh } from "../routes/OIDC";
import  { GetUserInfo } from "../routes/User";
import { SmartSchool } from "../structures/Smartschool";

export async function LoginWithToken(url: string, refreshToken: string, deviceId: string): Promise<SmartSchool> {
  const tokens = await OIDCRefresh(url, refreshToken);
  return GetUserInfo(
      tokens.access_token,
      tokens.refresh_token,
      url,
      deviceId
      );
}