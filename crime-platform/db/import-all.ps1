# Catalyst Data Store - Bulk Import Script
# Imports all CSVs in correct foreign-key dependency order
# Run from project root: .\db\import-all.ps1

$ErrorActionPreference = "Stop"
$baseDir = "$PSScriptRoot\catalyst-import"

# Tables in dependency order (parents first)
$tables = @(
    "State",
    "District",
    "UnitType",
    "Unit",
    "Rank",
    "Designation",
    "Employee",
    "CaseCategory",
    "GravityOffence",
    "CrimeHead",
    "CrimeSubHead",
    "Act",
    "Section",
    "CrimeHeadActSection",
    "Court",
    "CaseStatusMaster",
    "CasteMaster",
    "ReligionMaster",
    "OccupationMaster",
    "CaseMaster",
    "Inv_OccuranceTime",
    "ComplainantDetails",
    "ActSectionAssociation",
    "Victim",
    "Accused",
    "ArrestSurrender",
    "inv_arrestsurrenderaccused",
    "ChargesheetDetails"
)

$success = @()
$failed  = @()

foreach ($table in $tables) {
    $csv = "$baseDir\$table.csv"

    if (-not (Test-Path $csv)) {
        Write-Host "  [SKIP] $table - CSV not found at $csv" -ForegroundColor Yellow
        continue
    }

    Write-Host "`n[IMPORT] $table ..." -ForegroundColor Cyan

    try {
        catalyst ds:import --table $table $csv
        Write-Host "  [OK] $table import job submitted." -ForegroundColor Green
        $success += $table

        # Brief pause so Catalyst doesn't throttle rapid submissions
        Start-Sleep -Seconds 2
    }
    catch {
        Write-Host "  [FAIL] $table - $_" -ForegroundColor Red
        $failed += $table
    }
}

Write-Host "`n==============================" -ForegroundColor White
Write-Host "Import Summary" -ForegroundColor White
Write-Host "==============================" -ForegroundColor White
Write-Host "Submitted : $($success.Count)" -ForegroundColor Green
Write-Host "Failed    : $($failed.Count)"  -ForegroundColor Red

if ($failed.Count -gt 0) {
    Write-Host "`nFailed tables:" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

Write-Host "`nRun 'catalyst ds:status import' to check job progress." -ForegroundColor Cyan
