/**
 * Subtle text / cell-content scale on data row hover (file-cabinet and inventory tables).
 *
 * Add {@link DATA_TABLE_ROW_GROUP_CLASS} to {@link TableRow}, and merge
 * {@link DATA_TABLE_CELL_INNER_HOVER_CLASS} onto each cell’s inner wrapper or {@link TableSlotCell} `className`.
 *
 * **Scale:** {@link DATA_TABLE_HOVER_TEXT_SCALE} is **1.0015×** (~0.15% larger) on row hover — barely perceptible.
 */
/** Keep in sync with `scale-[…]` inside {@link DATA_TABLE_CELL_INNER_HOVER_CLASS}. */
export const DATA_TABLE_HOVER_TEXT_SCALE = 1.0015;

/** Default arrow cursor on the row; avoids the text (I-beam) cursor over labels. */
export const DATA_TABLE_ROW_GROUP_CLASS = "group/data-row cursor-default";

/** Shared neutral fill used by table headers and related chrome surfaces. */
export const DATA_TABLE_HEADER_BACKGROUND_CLASS =
  "bg-gray-100 dark:bg-gray-800/50";

/** Shared row hover fill used by the table and table-with-tabs surfaces. */
export const DATA_TABLE_ROW_HOVER_BACKGROUND_CLASS =
  "hover:!bg-gray-100 dark:hover:!bg-gray-800/50";

/** Header rows use the body hover fill as their resting background color. */
export const DATA_TABLE_HEADER_ROW_BACKGROUND_CLASS =
  "!bg-gray-100 dark:!bg-gray-800/50 hover:!bg-gray-100 dark:hover:!bg-gray-800/50";

/**
 * Cell inner shell: keep **default** cursor over text (`cursor-default` + descendants), restore
 * **pointer** for real controls (links / buttons).
 */
export const DATA_TABLE_CELL_INNER_HOVER_CLASS =
  "origin-center transform-gpu cursor-default [&_*]:cursor-default [&_a[href]]:cursor-pointer [&_button]:cursor-pointer [&_[role=button]]:cursor-pointer transition-transform duration-150 ease-out motion-reduce:transition-none motion-reduce:group-hover/data-row:scale-100 group-hover/data-row:scale-[1.0015]";
