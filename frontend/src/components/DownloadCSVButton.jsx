function DownloadCSVButton({
  data,
  columns,
  fileName = "climatelens-data.csv",
}) {
  const escapeCSVValue = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    let text = String(value);

    // Prevent spreadsheet formula injection
    if (/^[=+\-@]/.test(text)) {
      text = `'${text}`;
    }

    return `"${text.replace(/"/g, '""')}"`;
  };

  const downloadCSV = () => {
    if (!Array.isArray(data) || data.length === 0) {
      alert("There is no data available to download.");
      return;
    }

    const headers = columns.map((column) =>
      escapeCSVValue(column.label)
    );

    const rows = data.map((item) =>
      columns.map((column) =>
        escapeCSVValue(item[column.key])
      )
    );

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });

    const downloadURL = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const safeFileName = fileName
      .replace(/[^a-z0-9._-]/gi, "-")
      .replace(/-+/g, "-");

    link.href = downloadURL;
    link.download = safeFileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(downloadURL);
  };

  return (
    <button
      type="button"
      className="download-csv-button"
      onClick={downloadCSV}
    >
      📊 Download CSV Data
    </button>
  );
}

export default DownloadCSVButton;