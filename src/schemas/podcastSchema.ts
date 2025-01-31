import * as yup from 'yup';

export const podcastSchema = yup.object().shape({
  title: yup
    .string()
    .required('Title is required')
    .max(100, 'Title must be at most 100 characters'),
  host: yup
    .string()
    .required('Host is required')
    .max(60, 'Host must be at most 60 characters'),
  description: yup.string().required('Description is required'),
  photo: yup
    .mixed<File>()
    .required('Photo is required')
    .test('fileType', 'Only image files are allowed', (value) => {
      if (value && value instanceof File) {
        return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(
          value.type
        );
      }
      return false;
    })
    .test('fileSize', 'File is too large', (value) => {
      if (value && value instanceof File) {
        return value.size <= 5 * 1024 * 1024; // 5MB max file size
      }
      return false;
    }),
});
