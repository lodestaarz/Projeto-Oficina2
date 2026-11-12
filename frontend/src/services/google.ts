export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
export const googleConfigurado =
  googleClientId !== '' && !googleClientId.startsWith('seu-client-id');
