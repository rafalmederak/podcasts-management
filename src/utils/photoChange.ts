import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

export const handlePhotoChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setPhotoURL: React.Dispatch<React.SetStateAction<string>>
) => {
  const file = e.target.files?.[0];
  if (file) {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      if (fileReader.result) {
        setPhotoURL(fileReader.result as string);
      }
    };
    fileReader.readAsDataURL(file);
  }
};

export async function uploadFile(file: File, path: string) {
  const storage = getStorage();
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}
