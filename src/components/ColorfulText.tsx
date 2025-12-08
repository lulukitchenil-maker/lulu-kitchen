interface ColorfulTextProps {
  text: string;
  colors?: string[];
}

const defaultColors = [
  'text-red-600',
  'text-orange-600',
  'text-yellow-600',
  'text-pink-600',
  'text-rose-600',
  'text-amber-600',
];

export default function ColorfulText({ text, colors = defaultColors }: ColorfulTextProps) {
  return (
    <>
      {text.split('').map((char, index) => (
        <span key={index} className={colors[index % colors.length]}>
          {char}
        </span>
      ))}
    </>
  );
}
