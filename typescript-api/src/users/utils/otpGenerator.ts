import { User } from "../../users/db/userTable";
import { dbDetails } from "../../common/db/DB_details";
import { authenticator } from "otplib";

export const generateUniqueOtp = async (): Promise<string> => {
  let otp: string;
  let userWithSameOtp: User | null;

  // Get database table
  const userRepository = dbDetails.getRepository(User);

  do {
    otp = authenticator.generateSecret().slice(0, 4); // Generate a 4-character OTP
    // Check if any user exists with the same OTP
    userWithSameOtp = await userRepository.findOne({
      where: { password: otp }, // Adjust "password" to the correct OTP field
    });
  } while (userWithSameOtp); // Repeat if OTP exists

  return otp;
};
