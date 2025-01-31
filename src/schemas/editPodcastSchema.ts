import * as yup from 'yup';

export const editPodcastSchema = yup.object().shape({
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
});
