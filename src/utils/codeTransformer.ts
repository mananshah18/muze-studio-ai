/**
 * Transforms user code to be executable in the preview iframe
 * Removes import statements and handles exports
 * @param code The user's code
 * @returns Transformed code ready for execution
 */
export function transformCode(code: string): string {
  // Remove import statements
  let transformedCode = code.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');
  
  // Handle default exports
  transformedCode = transformedCode.replace(/export\s+default\s+function\s+(\w+)/g, 'function $1');
  
  // Handle named exports
  transformedCode = transformedCode.replace(/export\s+function\s+(\w+)/g, 'function $1');
  
  // Handle class exports
  transformedCode = transformedCode.replace(/export\s+default\s+class\s+(\w+)/g, 'class $1');
  transformedCode = transformedCode.replace(/export\s+class\s+(\w+)/g, 'class $1');
  
  // Handle variable exports
  transformedCode = transformedCode.replace(/export\s+const\s+/g, 'const ');
  transformedCode = transformedCode.replace(/export\s+let\s+/g, 'let ');
  transformedCode = transformedCode.replace(/export\s+var\s+/g, 'var ');
  
  return transformedCode;
} 