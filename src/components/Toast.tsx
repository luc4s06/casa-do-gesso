// A lógica e o container visual dos toasts vivem em src/hooks/useToast.tsx
// (ToastProvider + useToast), para que qualquer página possa disparar
// `showToast('mensagem')` sem prop-drilling. Este arquivo existe para
// manter a estrutura de componentes do projeto.
export { ToastProvider, useToast } from '../hooks/useToast'
