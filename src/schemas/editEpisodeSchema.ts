import * as yup from 'yup';

export const editEpisodeSchema = yup.object().shape({
  title: yup
    .string()
    .required('Title is required')
    .max(100, 'Title must be at most 100 characters'),
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
  audio: yup
    .mixed<File>()
    .test('fileType', 'Only audio files are allowed', (value) => {
      return (
        !value || ['audio/mpeg', 'audio/wav', 'audio/ogg'].includes(value.type)
      );
    })
    .test('fileSize', 'File is too large', (value) => {
      return !value || value.size <= 50 * 1024 * 1024;
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
