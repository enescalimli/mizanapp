import { NextResponse } from "next/server";
import { DETAILED_COMPANIES_DATABASE } from "@/lib/data/sampleCompanies";
import { ScreeningStandardCode } from "@/types/katilim";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase().trim();
  const { searchParams } = new URL(request.url);
  const standard: ScreeningStandardCode =
    (searchParams.get("standard") as ScreeningStandardCode) ||
    "BIST_KATILIM_DIB";

  const company = DETAILED_COMPANIES_DATABASE[upperTicker];

  if (!company) {
    return NextResponse.json(
      { error: `Şirket bulunamadı: ${upperTicker}` },
      { status: 404 }
    );
  }

  // If AAOIFI is requested, apply AAOIFI rules (30% threshold, MCAP denominator)
  if (standard === "AAOIFI_STD_21") {
    const aaoifiCompany = JSON.parse(JSON.stringify(company));
    aaoifiCompany.standardCode = "AAOIFI_STD_21";
    aaoifiCompany.ratios.interestDebt.thresholdPercentage = "%30.00";
    aaoifiCompany.ratios.interestDebt.toleranceCeilingPercentage = "%31.50";
    aaoifiCompany.ratios.interestCash.thresholdPercentage = "%30.00";
    aaoifiCompany.ratios.interestCash.toleranceCeilingPercentage = "%31.50";

    if (upperTicker === "THYAO") {
      aaoifiCompany.overallStatus = "GRACE_PERIOD_TOLERANCE";
      aaoifiCompany.ratios.interestDebt.isCompliant = false;
      aaoifiCompany.ratios.interestDebt.isInToleranceBand = true;
      aaoifiCompany.ratios.interestDebt.marginToLimitPercentage = "%0.85 Aşım (Hoşgörüde)";
      aaoifiCompany.gracePeriodInfo.isInGracePeriod = true;
      aaoifiCompany.gracePeriodInfo.consecutiveBreachQuarters = 1;
      aaoifiCompany.gracePeriodInfo.notes = [
        "AAOIFI Standard No. 21 (%30.00 eşiği) kapsamında borç oranı %30.85'tir.",
        "Tampon bölge (%31.50 tavanı) içinde kaldığından 1/2 çeyrek hoşgörü süresi (Grace Period) geçerlidir.",
      ];
    } else if (upperTicker === "BIMAS") {
      aaoifiCompany.overallStatus = "COMPLIANT";
    }

    return NextResponse.json(aaoifiCompany);
  }

  return NextResponse.json(company);
}
