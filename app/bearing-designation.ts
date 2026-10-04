/** Search-only normalization. Never use this value for customer-facing display. */
export const normalizeDesignation=(value:string)=>value.toUpperCase().replace(/[^A-Z0-9]/g,"");
