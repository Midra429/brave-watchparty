/**
 * @example
 * ```
 * classList('class1', 'class2', false)
 * // > 'class1 class2'
 * ```
 */
export const classList = (...args: (string | boolean | null | undefined)[]) => {
  return args.flatMap((v) => v || []).join(' ') || undefined
}
