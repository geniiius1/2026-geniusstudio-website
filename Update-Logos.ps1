$indexFile = "index.html"
$content = Get-Content $indexFile -Raw

# Helper to generate HTML for an array of logos
function Get-LogosHtml($files, $folder) {
    $html = "`r`n"
    foreach ($file in $files) {
        $name = $file.BaseName
        $html += "        <div class=`"logo-item`"><img src=`"$folder/$($file.Name)`" alt=`"$name`"><span>$name</span></div>`r`n"
    }
    # Duplicate for continuous scroll
    $html += "        <!-- Duplicate -->`r`n"
    foreach ($file in $files) {
        $name = $file.BaseName
        $html += "        <div class=`"logo-item`"><img src=`"$folder/$($file.Name)`" alt=`"$name`"><span>$name</span></div>`r`n"
    }
    $html += "        "
    return $html
}

# 1. Process Customer Logos
$customerFiles = Get-ChildItem -Path "customer_logos" -File | Where-Object Name -ne ".gitkeep" | Sort-Object Name
$halfLength = [math]::Ceiling($customerFiles.Count / 2)
$half1 = $customerFiles | Select-Object -First $halfLength
$half2 = $customerFiles | Select-Object -Last ($customerFiles.Count - $halfLength)

$html1 = Get-LogosHtml $half1 "customer_logos"
$html2 = Get-LogosHtml $half2 "customer_logos"

$content = $content -replace '(?s)<!-- CUSTOMER_LOGOS_START_1 -->.*?<!-- CUSTOMER_LOGOS_END_1 -->', "<!-- CUSTOMER_LOGOS_START_1 -->$html1<!-- CUSTOMER_LOGOS_END_1 -->"
$content = $content -replace '(?s)<!-- CUSTOMER_LOGOS_START_2 -->.*?<!-- CUSTOMER_LOGOS_END_2 -->', "<!-- CUSTOMER_LOGOS_START_2 -->$html2<!-- CUSTOMER_LOGOS_END_2 -->"

# 2. Process Partner Logos
$partnerFiles = Get-ChildItem -Path "partner_logos" -File | Where-Object Name -ne ".gitkeep" | Sort-Object Name
$htmlPartners = Get-LogosHtml $partnerFiles "partner_logos"

$content = $content -replace '(?s)<!-- PARTNER_LOGOS_START -->.*?<!-- PARTNER_LOGOS_END -->', "<!-- PARTNER_LOGOS_START -->$htmlPartners<!-- PARTNER_LOGOS_END -->"

# Save the updated index.html
Set-Content $indexFile $content -Encoding UTF8

Write-Host "Success! The logos on index.html have been updated."
Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
