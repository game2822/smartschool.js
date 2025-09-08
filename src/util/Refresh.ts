import { OIDCRefresh } from "../routes/OIDC";
import  { RegisterDevice } from "../routes/User";
import { SmartSchool } from "../structures/Smartschool";

export async function LoginWithToken(url: string, refreshToken: string, deviceType: string, deviceName: string, deviceId: string): Promise<SmartSchool> {
  const tokens = await OIDCRefresh(url, refreshToken);
  return RegisterDevice(
      tokens.access_token,
      tokens.refresh_token,
      url,
      deviceType,
      deviceName,
      deviceId
  );
}