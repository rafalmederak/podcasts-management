import * as yup from 'yup';
import { ILoginUserInputData } from '@/schemas/loginSchema';

export type IRegisterUserInputData = {
  name: string;
} & ILoginUserInputData;

export const registerUserSchema: yup.ObjectSchema<IRegisterUserInputData> = yup
  .object()
  .shape({
    name: yup.string().required().default(''),
    email: yup.string().email().required().default(''),
    password: yup.string().required().min(6).default(''),
  });

export const defaultRegisterUserInputData: IRegisterUserInputData =
  registerUserSchema.cast({});
