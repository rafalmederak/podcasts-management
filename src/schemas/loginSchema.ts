import * as yup from 'yup';

export type ILoginUserInputData = {
  email: string;
  password: string;
};

export const loginUserSchema: yup.ObjectSchema<ILoginUserInputData> = yup
  .object()
  .shape({
    email: yup.string().email().required().default(''),
    password: yup.string().required().min(6).default(''),
  });

export const defaultLoginUserInputData: ILoginUserInputData =
  loginUserSchema.cast({});
