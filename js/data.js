// data.js - Base de Dados de Procedimentos
// Nota: Em produção, o script.js buscará esses dados via API (FastAPI)

window.procedimentos = {
    ultrassom: [
        { nome: "US Transvaginal", valores: { particular: 160, desconto: 140, especial: 125, prefeitura: 110 } },
        { nome: "US Transvaginal p/ endometriose", valores: { particular: 260, desconto: 230, especial: 220, prefeitura: 210 } },
        { nome: "US Pelvico", valores: { particular: 130, desconto: 120, especial: 115, prefeitura: 110 } },
        { nome: "US Próstata", valores: { particular: 120, desconto: 105, especial: 90, prefeitura: 85 } },
        { nome: "US Articulação", valores: { particular: 160, desconto: 150, especial: 140, prefeitura: 120 } },
        { nome: "US Aparelho Urinário", valores: { particular: 170, desconto: 150, especial: 120, prefeitura: 120 } },
        { nome: "US Abdome Total", valores: { particular: 220, desconto: 200, especial: 190, prefeitura: 180 } },
        { nome: "US Abdome Superior", valores: { particular: 155, desconto: 135, especial: 105, prefeitura: 105 } },
        { nome: "US Órgãos", valores: { particular: 160, desconto: 140, especial: 110, prefeitura: 110 } },
        { nome: "US Mamas", valores: { particular: 190, desconto: 160, especial: 150, prefeitura: 140 } },
        { nome: "US Mamas e Axilas", valores: { particular: 230, desconto: 210, especial: 190, prefeitura: 180 } },
        { nome: "US Obstétrico", valores: { particular: 155, desconto: 135, especial: 130, prefeitura: 125 } },
        { nome: "US Obstétrico Transvaginal", valores: { particular: 165, desconto: 140, especial: 130, prefeitura: 125 } },
        { nome: "US Obstétrico com Doppler", valores: { particular: 235, desconto: 205, especial: 165, prefeitura: 160 } },
        { nome: "US Morfológico 1º Trimestre", valores: { particular: 220, desconto: 200, especial: 185, prefeitura: 180 } },
        { nome: "US Morfológico 2º Trimestre", valores: { particular: 240, desconto: 220, especial: 210, prefeitura: 200 } },
        { nome: "US Morfológico 1º Trimestre + Doppler", valores: { particular: 260, desconto: 230, especial: 220, prefeitura: 210 } }
    ],
    dopplers: [
        { nome: "Doppler de carótidas e vertebrais", valores: { particular: 370, desconto: 315, especial: 290, prefeitura: 270 } },
        { nome: "Doppler de Tireóide", valores: { particular: 235, desconto: 210, especial: 210, prefeitura: 190 } },
        { nome: "Doppler de 1 perna", valores: { particular: 355, desconto: 305, especial: 290, prefeitura: 270 } },
        { nome: "Doppler das Pernas", valores: { particular: 680, desconto: 610, especial: 550, prefeitura: 500 } }
    ],
    tomografias: [
        { nome: "TC de Coluna", valores: { particular: 365, desconto: 330, especial: 295, prefeitura: 265 } },
        { nome: "TC de Crânio", valores: { particular: 385, desconto: 355, especial: 305, prefeitura: 285 } },
        { nome: "TC Articulação", valores: { particular: 290, desconto: 245, especial: 225, prefeitura: 195 } },
        { nome: "TC de Abdome Superior", valores: { particular: 455, desconto: 405, especial: 380, prefeitura: 355 } },
        { nome: "TC de Abdome Total", valores: { particular: 905, desconto: 805, especial: 755, prefeitura: 705 } },
        { nome: "TC de Segmento", valores: { particular: 365, desconto: 225, especial: 175, prefeitura: 270 } },
        { nome: "TC de Tórax", valores: { particular: 425, desconto: 405, especial: 355, prefeitura: 305 } },
        { nome: "TC de Seios da Face", valores: { particular: 425, desconto: 405, especial: 355, prefeitura: 305 } },
        { nome: "TC da Face", valores: { particular: 425, desconto: 405, especial: 355, prefeitura: 305 } }
    ],
    rms: [
        { nome: "RM Coluna Lombar/Articulação", valores: { particular: 715, desconto: 600, especial: 505, prefeitura: 455 } },
        { nome: "RM Crânio ou Tórax", valores: { particular: 735, desconto: 645, especial: 515, prefeitura: 475 } },
        { nome: "RM Próstata", valores: { particular: 815, desconto: 715, especial: 665, prefeitura: 615 } },
        { nome: "RM Pelve/Pelve Endo", valores: { particular: 815, desconto: 715, especial: 665, prefeitura: 615 } }
    ],
    outros: [
        { nome: "DENSITOMETRIA ÓSSEA (Coluna e Fêmur)", valores: { particular: 220, desconto: 200, especial: 185, prefeitura: 175 } },
        { nome: "DENSITOMETRIA ÓSSEA (Corpo Inteiro)", valores: { particular: 195, desconto: 170, especial: 145, prefeitura: 130 } },
        { nome: "DENSITOMETRIA ÓSSEA (Um segmento)", valores: { particular: 117, desconto: 105, especial: 90, prefeitura: 85 } },
        { nome: "Rx Tórax PA", valores: { particular: 65, desconto: 60, especial: 55, prefeitura: 50 } },
        { nome: "Rx Tórax PA e Perfil", valores: { particular: 75, desconto: 70, especial: 65, prefeitura: 55 } },
        { nome: "Rx Coluna Total", valores: { particular: 165, desconto: 150, especial: 140, prefeitura: 135 } },
        { nome: "Ecocardiograma com Strain", valores: { particular: 455, desconto: 435, especial: 435, prefeitura: 435 } },
        { nome: "Ecocardiograma Transtorácico", valores: { particular: 385, desconto: 335, especial: 335, prefeitura: 335 } },
        { nome: "EcoFetal", valores: { particular: 455, desconto: 435, especial: 435, prefeitura: 435 } },
        { nome: "Eletrocardiograma (ECG)", valores: { particular: 55, desconto: 50, especial: 50, prefeitura: 50 } },
        { nome: "Histerossalpingografia", valores: { particular: 560, desconto: 510, especial: 510, prefeitura: 510 } },
        { nome: "Elastografia Hepática", valores: { particular: 460, desconto: 460, especial: 460, prefeitura: 460 } },
        { nome: "Mamografia", valores: { particular: 205, desconto: 185, especial: 165, prefeitura: 155 } }
    ]
};