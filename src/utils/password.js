import argon2 from "argon2";

export const hashPassword = async (plainPassword) => {
  return await argon2.hash(plainPassword, {
    type: argon2.argon2id,
    memoryCost: 2 ** 15,
    timeCost: 3,
    parallelism: 1,
  });
};

export const verifyPassword = async (hashedPassword, plainPassword) => {
  return await argon2.verify(hashedPassword, plainPassword);
};
