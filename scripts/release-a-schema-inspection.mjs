/**
 * Pure schema-metadata comparison helpers for the Release A catalogue migrations.
 * These do not open a database connection or change schema state.
 */
function metadataValue(row, lowercaseName, uppercaseName) {
  if (Object.hasOwn(row, lowercaseName)) return row[lowercaseName];
  if (Object.hasOwn(row, uppercaseName)) return row[uppercaseName];
  throw new Error(`MySQL metadata row is missing ${lowercaseName}/${uppercaseName}.`);
}

/** Normalize a mysql2 INFORMATION_SCHEMA.COLUMNS row without relaxing validation. */
export function normalizeColumnMetadata(row) {
  return [
    metadataValue(row, "column_name", "COLUMN_NAME"),
    {
      type: String(metadataValue(row, "column_type", "COLUMN_TYPE")).toLowerCase(),
      nullable: metadataValue(row, "is_nullable", "IS_NULLABLE"),
      defaultValue: metadataValue(row, "column_default", "COLUMN_DEFAULT"),
    },
  ];
}

/** Normalize a mysql2 INFORMATION_SCHEMA.STATISTICS row without relaxing validation. */
export function normalizeIndexMetadata(row) {
  return {
    name: metadataValue(row, "index_name", "INDEX_NAME"),
    nonUnique: metadataValue(row, "non_unique", "NON_UNIQUE"),
    sequence: metadataValue(row, "seq_in_index", "SEQ_IN_INDEX"),
    columnName: metadataValue(row, "column_name", "COLUMN_NAME"),
  };
}

export function columnDiagnostics(columns, expected) {
  const items = expected.map(([name, type, nullable, defaultValue]) => {
    const actual = columns.get(name);
    // MySQL represents a NULL default as JavaScript null. Compare it consistently
    // with the migration definition while still reporting a serializable value.
    const expectedDefault = String(defaultValue ?? "");
    const actualDefault = String(actual?.defaultValue ?? "");
    const result = !actual
      ? "missing"
      : actual.type !== type || actual.nullable !== nullable || actualDefault !== expectedDefault
        ? "incompatible"
        : "match";
    return {
      name,
      expected: { type, nullable, defaultValue: expectedDefault },
      actual: actual ? { type: actual.type, nullable: actual.nullable, defaultValue: actualDefault } : null,
      result,
    };
  });
  const present = items.filter((item) => item.result !== "missing").length;
  return {
    state: present === 0 ? "absent" : present !== items.length ? "partial" : items.every((item) => item.result === "match") ? "complete" : "incompatible",
    items,
  };
}

export function indexDiagnostics(indexes, expected) {
  const items = Object.entries(expected).map(([name, definition]) => {
    const actual = indexes.get(name);
    const actualDefinition = actual ? { unique: actual.unique, columns: actual.columns } : null;
    const result = !actual
      ? "missing"
      : actual.unique !== definition.unique || actual.columns.join(",") !== definition.columns.join(",")
        ? "incompatible"
        : "match";
    return { name, expected: definition, actual: actualDefinition, result };
  });
  const present = items.filter((item) => item.result !== "missing").length;
  return {
    state: present === 0 ? "absent" : present !== items.length ? "partial" : items.every((item) => item.result === "match") ? "complete" : "incompatible",
    items,
  };
}
