# Fix ALL supabase.from('cms_sections') patterns (both inline and chained multi-line)
# Strategy: replace the .from('cms_sections') call at the source so the chain becomes (supabase.from(...) as any)

$files = Get-ChildItem -Path 'c:\Users\Sushant\inkwave_J\src\app\(admin)' -Recurse -Filter '*.tsx' | Select-Object -ExpandProperty FullName

$old  = ".from('cms_sections')"
$new  = ".from('cms_sections') as any)"

foreach ($path in $files) {
  $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
  
  # Replace: supabase\n      .from('cms_sections') — multiline chained style
  $pattern1 = "supabase`r`n      .from('cms_sections')"
  $replace1 = "(supabase.from('cms_sections') as any)"
  
  $pattern2 = "supabase`n      .from('cms_sections')"
  $replace2 = "(supabase.from('cms_sections') as any)"

  # Also handle: "supabase\r\n  .from('cms_sections')" (2 space indent)
  $pattern3 = "supabase`r`n  .from('cms_sections')"
  $replace3 = "(supabase.from('cms_sections') as any)"
  
  $pattern4 = "supabase`n  .from('cms_sections')"
  $replace4 = "(supabase.from('cms_sections') as any)"

  $updated = $content.Replace($pattern1, $replace1).Replace($pattern2, $replace2).Replace($pattern3, $replace3).Replace($pattern4, $replace4)
  
  if ($updated -ne $content) {
    [System.IO.File]::WriteAllText($path, $updated, [System.Text.Encoding]::UTF8)
    Write-Host "Fixed multiline: $path"
  }
}

Write-Host "All done."
