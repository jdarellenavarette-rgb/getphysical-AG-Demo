/** A QR code drawn as a grid so it prints cleanly. Always black on white, whatever the theme. */
export function QrCode({ modules, label }: { modules: readonly (readonly boolean[])[]; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="grid shrink-0 bg-white p-3"
      style={{ gridTemplateColumns: `repeat(${modules.length}, 5px)`, gridAutoRows: "5px" }}
    >
      {modules.flatMap((row, y) =>
        row.map((dark, x) => <span key={`${y}-${x}`} className={dark ? "bg-black" : "bg-white"} />),
      )}
    </div>
  );
}
