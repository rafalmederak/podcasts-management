import * as yup from 'yup';

export const editTrophySchema = yup.object().shape({
  title: yup
    .string()
    .required('Title is required')
    .max(100, 'Title must be at most 100 characters'),

  photo: yup
    .mixed<File>()
    .test('fileType', 'Only image files are allowed', (value) => {
      return (
        !value ||
        ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(
          value.type
        )
      );
    })
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      return !value || value.size <= 5 * 1024 * 1024;
    }),

  description: yup.string().required('Description is required'),

  level: yup
    .number()
    .required('Level is required')
    .min(1, 'Level must be at least 1')
    .max(3, 'Level must be at most 3'),

  task: yup.object().shape({
    question: yup
      .string()
      .required('Task question is required')
      .max(200, 'Task question must be at most 200 characters'),

    type: yup
      .string()
      .oneOf(['radio'], 'Invalid task type')
      .required('Task type is required'),

    radioOptions: yup
      .array()
      .of(
        yup
          .string()
          .required('Each option must be a non-empty string')
          .max(100, 'Option must be at most 100 characters')
      )
      .min(2, 'You must provide at least two options')
      .required('Radio options are required'),
  }),

  goodAnswerIndex: yup.number().nullable().required('Good answer is required'),
});
