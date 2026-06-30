const SQL_INJECTION_PATTERNS: RegExp[] = [
  /'\s*or\s*'?\d/i,
  /"\s*or\s*"?\d/i,
  /\bor\s+1\s*=\s*1\b/i,
  /\band\s+1\s*=\s*1\b/i,
  /'\s*--/,
  /;\s*--/,
  /\/\*/,
  /\bunion\b[\s\S]*\bselect\b/i,
  /\bselect\b[\s\S]*\bfrom\b/i,
  /\bdrop\b\s+\b(table|database|schema)\b/i,
  /\binsert\b\s+\binto\b/i,
  /\bdelete\b\s+\bfrom\b/i,
  /\bupdate\b[\s\S]*\bset\b/i,
  /\bexec(\s|ute|\()/i,
  /\bxp_\w+/i,
  /\bsleep\s*\(/i,
  /\bbenchmark\s*\(/i,
  /\bwaitfor\b\s+\bdelay\b/i,
  /\bchar\s*\(/i,
  /\bconcat\s*\(/i,
  /\b0x[0-9a-f]{4,}\b/i,
  /@@\w+/i,
  /;\s*shutdown\b/i,
  /'\s*;\s*drop\b/i,
];

export function containsSqlInjection(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  const normalized = trimmed.toLowerCase().replace(/\s+/g, ' ');
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function findSqlInjectionField(
  fields: Record<string, string>,
): { field: string; label: string } | null {
  const labels: Record<string, string> = {
    fullName: 'Full name',
    email: 'Email',
    company: 'Company',
  };

  for (const [key, value] of Object.entries(fields)) {
    if (containsSqlInjection(value)) {
      return { field: key, label: labels[key] ?? key };
    }
  }

  return null;
}
