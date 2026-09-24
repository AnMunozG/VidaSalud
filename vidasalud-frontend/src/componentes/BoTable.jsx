export default function BoTable({ columnas, children }) {
  return (
    <div className="bo-table-wrapper">
      <table className="bo-table">
        <thead>
          <tr>
            {columnas.map((c) => {
              const th = typeof c === "string" ? { texto: c } : c;
              return <th key={th.texto} className={th.clase || ""}>{th.texto}</th>;
            })}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}