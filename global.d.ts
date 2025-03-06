// Extend the Window interface to add the m property
declare module "@viz/muze";
declare global {
  interface Window {
    muze: typeof muze; // Replace 'typeof m' with the actual type of 'm' if you know it
  }
}
