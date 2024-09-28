// ProjectLunarFN - Backend (ArisaVurr02)
// ShopManager - SDK v2.0.1

export interface FeaturedTemplate {
  devName: string;
  offerId: string;
  fulfillmentIds: any[];
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  categories: any;
  prices: [
    {
      currencyType: "MtxCurrency";
      currencySubType: string;
      regularPrice: number;
      finalPrice: number;
      saleExpiration: string;
      basePrice: number;
    }
  ];
  meta: {
    SectionId: string;
    TileSize: string;
  };
  matchFilter: string;
  filterWeight: number;
  appStoreId: any;
  requirements: [
    {
      requirementType: string;
      requiredId: string;
      minQuantity: number;
    }
  ];
  offerType: string;
  giftInfo: {
    bIsEnabled: boolean;
    forcedGiftBoxTemplateId: string;
    purchaseRequirements: any;
    giftRecordIds: any;
  };
  refundable: boolean;
  metaInfo: [
    {
      key: string;
      value: string;
    },
    {
      key: string;
      value: string;
    }
  ];
  displayAssetPath: string;
  itemGrants: [
    {
      templateId: string;
      quantity: number;
    }
  ];
  sortPriority: number;
  catalogGroupPriority: number;
}

export interface SecondaryTemplate {
  devName: string;
  offerId: string;
  fulfillmentIds: any[];
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  categories: any[];
  prices: [
    {
      currencyType: string;
      currencySubType: string;
      regularPrice: number;
      finalPrice: number;
      saleExpiration: string;
      basePrice: number;
    }
  ];
  meta: {
    SectionId: string;
    TileSize: string;
  };
  matchFilter: string;
  filterWeight: number;
  appStoreId: any[];
  requirements: [
    {
      requirementType: string;
      requiredId: string;
      minQuantity: number;
    }
  ];
  offerType: string;
  giftInfo: {
    bIsEnabled: boolean;
    forcedGiftBoxTemplateId: string;
    purchaseRequirements: any[];
    giftRecordIds: any[];
  };
  refundable: boolean;
  metaInfo: [
    {
      key: string;
      value: string;
    },
    {
      key: string;
      value: string;
    }
  ];
  displayAssetPath: string;
  itemGrants: [
    {
      templateId: string;
      quantity: number;
    }
  ];
  sortPriority: number;
  catalogGroupPriority: number;
}
