/**
 * Subtle text / cell-content scale on data row hover (file-cabinet and inventory tables).
 *
 * Add {@link DATA_TABLE_ROW_GROUP_CLASS} to {@link TableRow}, and merge
 * {@link DATA_TABLE_CELL_INNER_HOVER_CLASS} onto each cell’s inner wrapper or {@link TableSlotCell} `className`.
 *
 * **Scale:** {@link DATA_TABLE_HOVER_TEXT_SCALE} is **1.015×** (~1.5% larger) on row hover — visible but still light.
 */
/** Keep in sync with `scale-[…]` inside {@link DATA_TABLE_CELL_INNER_HOVER_CLASS}. */
export const DATA_TABLE_HOVER_TEXT_SCALE = 1.015;

/** Default arrow cursor on the row; avoids the text (I-beam) cursor over labels. */
export const DATA_TABLE_ROW_GROUP_CLASS = "group/data-row cursor-default";

/**
 * Cell inner shell: keep **default** cursor over text (`cursor-default` + descendants), restore
 * **pointer** for real controls (links / buttons).
 */
export const DATA_TABLE_CELL_INNER_HOVER_CLASS =
  "origin-center transform-gpu cursor-default [&_*]:cursor-default [&_a[href]]:cursor-pointer [&_button]:cursor-pointer [&_[role=button]]:cursor-pointer transition-transform duration-150 ease-out motion-reduce:transition-none motion-reduce:group-hover/data-row:scale-100 group-hover/data-row:scale-[1.015]";
