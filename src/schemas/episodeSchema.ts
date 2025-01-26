import * as yup from 'yup';

export const episodeSchema = yup.object().shape({
  title: yup
    .string()
    .required('Title is required')
    .max(100, 'Title must be at most 100 characters'),
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
  audio: yup
    .mixed<File>()
    .required('Audio file is required')
    .test('fileType', 'Only audio files are allowed', (value) => {
      if (value && value instanceof File) {
        return ['audio/mpeg', 'audio/wav', 'audio/ogg'].includes(value.type);
      }
      return false;
    })
    .test('fileSize', 'File is too large', (value) => {
      if (value && value instanceof File) {
        return value.size <= 50 * 1024 * 1024; // 50MB max file size
      }
      return false;
    }),
  date: yup
    .string()
    .required('Date is required')
    .test('isNotFutureDate', 'Date cannot be in the future', (value) => {
      if (!value) return true;
      const today = new Date();
      const inputDate = new Date(value);
      return inputDate <= today;
    }),
  longDescription: yup.string().required('Long description is required'),
  spotifyURL: yup.string(),
  applePodcastsURL: yup.string(),
  ytMusicURL: yup.string(),
});
