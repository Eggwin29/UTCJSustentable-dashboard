interface SidebarSubHeaderProps {
  title: string;
}

export default function SidebarSubHeader({ title }: SidebarSubHeaderProps) {
  return (
    <div className="flex items-center justify-between px-3 mb-1 mt-4">
      <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
        {title}
      </span>
    </div>
  );
}