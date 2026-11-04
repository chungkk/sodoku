import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="1em" height="1em" {...props}>
      {children}
    </svg>
  );
}

export const UndoIcon = (p: IconProps) => <Icon {...p}><path d="M9 7 4 12l5 5" /><path d="M4 12h10a5 5 0 0 1 5 5v1" /></Icon>;
export const EraseIcon = (p: IconProps) => <Icon {...p}><path d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7Z" /><path d="m12 10 4 4M16 10l-4 4" /></Icon>;
export const PencilIcon = (p: IconProps) => <Icon {...p}><path d="M4 20l1-5L16 4l4 4L9 19Z" /><path d="m14 6 4 4" /></Icon>;
export const PauseIcon = (p: IconProps) => <Icon {...p}><path d="M8 5v14M16 5v14" /></Icon>;
export const PlayIcon = (p: IconProps) => <Icon {...p}><path d="M7 5l12 7-12 7Z" fill="currentColor" /></Icon>;
export const FlagIcon = (p: IconProps) => <Icon {...p}><path d="M6 21V4" /><path d="M6 5c4-2 7 2 12 0v9c-5 2-8-2-12 0" /></Icon>;
export const DoorIcon = (p: IconProps) => <Icon {...p}><path d="M14 4H7a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h7" /><path d="M11 12h10M18 9l3 3-3 3" /></Icon>;
export const CopyIcon = (p: IconProps) => <Icon {...p}><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1" /></Icon>;
export const CheckIcon = (p: IconProps) => <Icon {...p}><path d="m5 13 4 4L19 7" /></Icon>;
export const CrownIcon = (p: IconProps) => <Icon {...p}><path d="M4 8l4 4 4-7 4 7 4-4-2 11H6Z" fill="currentColor" /></Icon>;
export const PlusIcon = (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>;
export const MinusIcon = (p: IconProps) => <Icon {...p}><path d="M5 12h14" /></Icon>;
export const ExpandIcon = (p: IconProps) => <Icon {...p}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></Icon>;
export const BackIcon = (p: IconProps) => <Icon {...p}><path d="M15 5l-7 7 7 7" /></Icon>;
export const RefreshIcon = (p: IconProps) => <Icon {...p}><path d="M20 11a8 8 0 0 0-14-4L4 9" /><path d="M4 4v5h5" /><path d="M4 13a8 8 0 0 0 14 4l2-2" /><path d="M20 20v-5h-5" /></Icon>;
