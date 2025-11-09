const color = getCharacterColor(character);
const appearance = [
    {
        "Group": "ItemDevices",
        "Name": "Trolley",
        "Property": {
            "TypeRecord": {
                "typed": 1
            },
            "Difficulty": 5,
            "SetPose": [
                "BaseLower"
            ],
            "AllowActivePose": [
                "BaseLower",
                "LegsOpen",
                "LegsClosed",
                "Spread"
            ]
        }
    },
    {
        "Group": "ItemNipples",
        "Name": "KittyPasties",
        "Color": [
            "#444444"
        ]
    },
    {
        "Group": "ItemTorso",
        "Name": "HarnessBra2",
        "Difficulty": 8
    },
    {
        "Group": "ItemArms",
        "Name": "ShinyStraitjacket",
        "Color": [
            color,
            "#686868",
            "#B6B6B6",
            "#404040",
            "#C5C5C5",
            "#292929"
        ],
        "Difficulty": 20,
        "Property": {
            "TypeRecord": {
                "typed": 1
            },
            "Block": [
                "ItemPelvis",
                "ItemTorso",
                "ItemTorso2",
                "ItemBreast",
                "ItemNipples",
                "ItemNipplesPiercings",
                "ItemVulva",
                "ItemVulvaPiercings",
                "ItemButt"
            ],
            "Hide": [
                "Bra",
                "Panties",
                "ItemNipples",
                "ItemNipplesPiercings",
                "ItemBreast"
            ]
        }
    },
    {
        "Group": "ItemLegs",
        "Name": "ShinyLegBinder",
        "Color": [
            color,
            "#404040",
            "Default",
            "#686868",
            "#B5B5B5",
            "#2D2D2D"
        ],
        "Difficulty": 20,
        "Property": {
            "TypeRecord": {
                "typed": 1
            }
        }
    },
    {
        "Group": "ItemMouth",
        "Name": "FuturisticHarnessBallGag",
        "Color": [
            "#939393",
            "#C44646",
            "#343434",
            "#2A2A2A",
            "#1F1F1F"
        ],
        "Difficulty": 10,
        "Property": {
            "TypeRecord": {
                "g": 2,
                "p": 3,
                "t": 0
            },
            "Difficulty": 0,
            "ShowText": true,
            "OriginalSetting": 1,
            "BlinkState": true,
            "AutoPunishUndoTime": 1762587617417.5056,
            "Block": [],
            "Effect": [
                "BlockMouth",
                "UseRemote",
                "GagTotal"
            ],
            "Hide": [
                "Mouth"
            ],
            "HideItem": [],
            "AllowActivity": [],
            "Attribute": [
                "FuturisticRecolor"
            ],
            "AutoPunish": 3,
            "AutoPunishUndoTimeSetting": 120000
        },
        "Craft": {
            "Item": "FuturisticHarnessBallGag",
            "Name": "闭嘴喵❤",
            "Description": "你好吵喵！闭嘴啦喵！❤\n**tamper-proof**\n**self-tightening**",
            "Color": "#939393,#C44646,#343434,#2A2A2A,#1F1F1F",
            "Property": "Large",
            "Lock": "",
            "Private": true,
            "ItemProperty": {},
            "Type": null,
            "TypeRecord": null,
            "DifficultyFactor": 4,
            "MemberNumber": 220334,
            "MemberName": "晴雪"
        }
    },
    {
        "Group": "ItemHood",
        "Name": "CustomLatexHood",
        "Color": [
            "Default",
            "#202020",
            "#797979",
            "#202020",
            "#202020",
            "#202020",
            "#202020",
            "#292929",
            "#292929",
            "#292929",
            "#1C1C1C",
            "#B7B7B7"
        ],
        "Difficulty": 5,
        "Property": {
            "TypeRecord": {
                "m": 25,
                "e": 0,
                "x": 1,
                "h": 0,
                "z": 0
            },
            "Difficulty": 0,
            "Block": [
                "ItemEars",
                "ItemMouth",
                "ItemMouth2",
                "ItemMouth3"
            ],
            "Effect": [
                "BlockMouth",
                "BlindHeavy"
            ],
            "Hide": [],
            "HideItem": [
                "HatFacePaint",
                "MaskFacePaint",
                "ClothAccessoryFacePaint"
            ],
            "AllowActivity": [],
            "Attribute": [],
            "OverridePriority": {
                "PanelHead": 38,
                "PanelHeadTransparent": 38,
                "PanelHeadHighlight": 38,
                "PanelHeadS": 38,
                "PanelHeadTransparentS": 38,
                "PanelHeadHighlightS": 38,
                "PanelHeadN": 38,
                "PanelHeadTransparentN": 38,
                "PanelHeadHighlightN": 38,
                "PanelNoEye": 38,
                "PanelNoEyeTransparent": 38,
                "PanelHoleNoEye": 38,
                "PanelHoleNoEyeTransparent": 38,
                "PanelNoEyeHighlight": 38,
                "PanelRoundEye": 38,
                "PanelRoundEyeTransparent": 38,
                "PanelRoundEyeHighlight": 38,
                "PanelShapedEye": 38,
                "PanelShapedEyeTransparent": 38,
                "PanelShapedEyeHighlight": 38,
                "PanelCircleEye": 38,
                "PanelCircleEyeTransparent": 38,
                "PanelCircleEyeHighlight": 38,
                "FillRoundEye": 38,
                "FillRoundEyeTransparent": 38,
                "FillHoleRoundEye": 38,
                "FillHoleRoundEyeTransparent": 38,
                "FillRoundEyeHighlight": 38,
                "FillShapedEye": 38,
                "FillShapedEyeTransparent": 38,
                "FillHoleShapedEye": 38,
                "FillHoleShapedEyeTransparent": 38,
                "FillShapedEyeHighlight": 38,
                "FillCircleEye": 38,
                "FillCircleEyeTransparent": 38,
                "PanelNoMouth": 38,
                "PanelNoMouthTransparent": 38,
                "PanelHoleNoMouth": 38,
                "PanelHoleNoMouthTransparent": 38,
                "PanelNoMouthHighlight": 38,
                "PanelRoundMouth": 38,
                "PanelRoundMouthTransparent": 38,
                "PanelRoundMouthHighlight": 38,
                "PanelShapedMouth": 38,
                "PanelShapedMouthTransparent": 38,
                "PanelShapedMouthHighlight": 38,
                "PanelFishnetMouth": 38,
                "PanelCircleMouth": 38,
                "PanelCircleMouthTransparent": 38,
                "PanelCircleMouthHighlight": 38,
                "FillRoundMouth": 38,
                "FillRoundMouthTransparent": 38,
                "FillHoleRoundMouth": 38,
                "FillHoleRoundMouthTransparent": 38,
                "FillShapedMouth": 38,
                "FillShapedMouthTransparent": 38,
                "FillHoleShapedMouth": 38,
                "FillHoleShapedMouthTransparent": 38,
                "FillCircleMouth": 38,
                "FillCircleMouthTransparent": 38,
                "LiningRoundFace": 38,
                "LiningRoundFaceHighlight": 38,
                "LiningCrossFace": 38,
                "LiningCrossFaceHighlight": 38,
                "LiningRoundEye": 38,
                "LiningRoundEyeHighlight": 38,
                "LiningShapedEye": 38,
                "LiningShapedEyeHighlight": 38,
                "LiningRoundMouth": 38,
                "LiningShapedMouth": 38,
                "LiningCircleEye": 38,
                "LiningCircleEyeHighlight": 38,
                "LiningCircleMouth": 38
            }
        }
    },
    {
        "Group": "ItemBoots",
        "Name": "LeatherToeCuffs",
        "Difficulty": 3
    },
    {
        "Group": "Socks",
        "Name": "丝袜_Luzi"
    },
    {
        "Group": "Suit",
        "Name": "SeethroughSuit",
        "Color": [
            "#000000",
            "#000000"
        ],
        "Property": {
            "TypeRecord": {
                "typed": 0
            }
        }
    },
    {
        "Group": "ItemNipplesPiercings",
        "Name": "VibeHeartPiercings",
        "Color": [
            "#333333",
            "Default"
        ],
        "Difficulty": 10,
        "Property": {
            "TypeRecord": {
                "vibrating": 7
            },
            "State": "Rest",
            "Effect": [
                "Vibrating",
                "Edged",
                "Egged"
            ],
            "Mode": "Tease",
            "Intensity": -1
        }
    },
    {
        "Group": "ItemVulva",
        "Name": "VibratingDildo",
        "Color": [
            "#393939",
            "#393939"
        ],
        "Property": {
            "TypeRecord": {
                "vibrating": 7
            },
            "State": "Rest",
            "Effect": [
                "Vibrating",
                "Egged"
            ],
            "Mode": "Tease",
            "Intensity": -1
        },
        "Craft": {
            "Item": "VibratingDildo",
            "Name": "深邃的触动",
            "Description": "❤集中精力去感受它哦喵❤",
            "Color": "#393939,#393939",
            "Property": "Arousing",
            "Lock": "",
            "Private": true,
            "ItemProperty": {},
            "Type": null,
            "TypeRecord": {
                "vibrating": 4
            },
            "MemberNumber": 220334,
            "MemberName": "晴雪"
        }
    },
    {
        "Group": "ItemPelvis",
        "Name": "幸运贞操带",
        "Color": [
            "#000000",
            "#2D2D2D",
            "#BEBEBE",
            "#B8B8B8"
        ],
        "Difficulty": 42,
        "Property": {
            "TypeRecord": {
                "s": 3,
                "o": 0,
                "t": 1
            },
            "Difficulty": 0,
            "OrgasmCount": 1,
            "RuinedOrgasmCount": 0,
            "ResistedOrgasmCount": 0,
            "WornTime": 1762521702627,
            "Block": [
                "ItemVulva",
                "ItemVulvaPiercings",
                "ItemButt"
            ],
            "Effect": [
                "CanEdge",
                "Chaste",
                "ButtChaste"
            ],
            "Hide": [
                "Pussy"
            ],
            "HideItem": [],
            "AllowActivity": [],
            "Attribute": [],
            "ShockLevel": 2,
            "LastOrgasmTime": 1762587371124
        }
    },
    {
        "Group": "ItemButt",
        "Name": "EggVibePlugXXL",
        "Property": {
            "TypeRecord": {
                "vibrating": 7
            },
            "State": "Deny",
            "Effect": [
                "Vibrating",
                "Edged",
                "Egged"
            ],
            "Mode": "Tease",
            "Intensity": 2
        }
    }
];

applyAppearance(character, appearance, {
    disableCloth: true,
    disableUnderwear: true,
    disableCosplay: true,
});
