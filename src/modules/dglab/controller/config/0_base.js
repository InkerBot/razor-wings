export default function configureIntensitySystem(registry) {
    registry.registerAction(['Spank', 'SpankItem', 'Slap', 'LSCG_Bap', 'LSCG_SlapPenis'], {
        priority: 30,
        comment: '打: 0.3',
        effect: (intensity, context) => 0.3
    })
    registry.registerAction(['Kick', 'Pinch', 'Nibble', 'LSCG_Flick', '轻弹额头', '弹阴蒂'], {
        priority: 30,
        comment: '打类似的: 0.2',
        effect: (intensity, context) => 0.2
    })
    registry.registerAction('Bite', {
        priority: 30,
        comment: '咬: 0.3',
        effect: (intensity, context) => 0.3
    })
    registry.registerAction('Nibble', {
        priority: 30,
        comment: '轻咬: 0.15',
        effect: (intensity, context) => 0.15
    })
    registry.registerAction([
        'Caress', 'MassageHands', 'Grope', 'Pinch', 'Lick', 'Kiss', 'XSAct_头蹭', 'XSAct_脸蹭', 'XSAct_鼻子蹭', 'Cuddle',
        '摇晃手臂', 'LSCG_Nuzzle', 'LSCG_Hug'
    ], {
        priority: 30,
        comment: '爱抚: 0.1',
        effect: (intensity, context) => 0.1
    })

    // 电击
    registry.registerAction('TriggerShock0', {
        priority: 30,
        comment: '低电击: 0.4',
        effect: (intensity, context) => 0.4
    })
    registry.registerAction('TriggerShock1', {
        priority: 30,
        comment: '中电击: 0.6',
        effect: (intensity, context) => 0.6
    })
    registry.registerAction('TriggerShock2', {
        priority: 30,
        comment: '高电击: 0.8',
        effect: (intensity, context) => 0.8
    })
    registry.registerAction('ShockItem', {
        priority: 30,
        comment: '道具电击: 0.6',
        effect: (intensity, context) => 0.6
    })
    registry.registerAction(['MasturbateHand', 'MasturbateItem', 'MasturbateFist'], {
        priority: 30,
        comment: '性刺激: 0.5',
        effect: (intensity, context) => 0.5,
    })
    registry.registerAction(['Tickle', 'TickleItem'], {
        priority: 30,
        comment: '挠痒痒: 0.3',
        effect: (intensity, context) => 0.3,
    })
    registry.registerAction(['RollItem'], {
        priority: 30,
        comment: '滚动道具: 0.3',
        effect: (intensity, context) => 0.3
    })

    // 注册目标部位效果
    // 乳房
    registry.registerTarget('ItemBreast', {
        priority: 20,
        comment: '乳房: * 1.2',
        effect: (intensity, context) => intensity * 1.2,
    });
    // 乳头
    registry.registerTarget('ItemNipples', {
        priority: 20,
        comment: '乳头: * 1.4',
        effect: (intensity, context) => intensity * 1.2,
    });
    // 阴部
    registry.registerTarget('ItemTorso', {
        priority: 20,
        comment: '阴部: * 1.3',
        effect: (intensity, context) => intensity * 1.3,
    });
    // 阴蒂
    registry.registerTarget('ItemVulvaPiercings', {
        priority: 20,
        comment: '阴蒂: * 1.5',
        effect: (intensity, context) => intensity * 1.5,
    });

    // 注册道具效果
    // 鞭打类道具
    registry.registerItem(['HeartCrop', 'WhipPaddle', 'Whip', 'Crop', 'Belt', 'Flogger'], {
        priority: 10,
        comment: '鞭打类道具: * 1.3',
        effect: (intensity, context) => intensity * 1.3,
    })

    // 拍打类道具
    registry.registerItem(['Ruler', 'Gavel', 'Paddle', 'TennisRacket', 'Spatula'], {
        priority: 10,
        comment: '拍打类道具: * 1.2',
        effect: (intensity, context) => intensity * 1.2,
    })

    // 钝器类道具
    registry.registerItem(['Cane', 'Broom', 'Baguette', 'Sword', 'AnimeGirlWand', 'PetToy'], {
        priority: 10,
        comment: '钝器类道具: * 1.1',
        effect: (intensity, context) => intensity * 1.1,
    })
}
