"""
Gera o diagrama de casos de uso do CoreMotiom (PNG 300 dpi e SVG).

Layout: à esquerda ficam os atores de uso geral (Visitante, Atleta, Lojista) e os casos
de uso que eles acessam; à direita ficam os atores de gestão (Supervisor, Administrador).
Dimensão: 16 cm de largura, a largura útil de uma página A4 com margens ABNT.

Uso:  python3 gerar_caso_de_uso.py   (requer matplotlib)
"""
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse, Rectangle

OUT = Path(__file__).resolve().parent
CM = 1 / 2.54  # polegadas por centímetro
plt.rcParams["font.family"] = "DejaVu Sans"

fig = plt.figure(figsize=(16 * CM, 13.6 * CM), dpi=300)
ax = fig.add_axes([0, 0, 1, 1])
ax.set_xlim(0, 10)
ax.set_ylim(0, 8.5)
ax.axis("off")

# Fronteira do sistema
ax.add_patch(Rectangle((2.2, 0.25), 6.3, 7.75, fill=False, lw=0.9, ec="#222222"))
ax.text(5.35, 8.18, "Sistema CoreMotiom", ha="center", va="center", fontsize=9, fontweight="bold")

OVAL_H, FS = 0.70, 7.5
LEFT_CX, RIGHT_CX = 3.55, 6.6
LEFT_W, RIGHT_W = 2.5, 2.8


def use_case(cx, cy, label, width):
    ax.add_patch(Ellipse((cx, cy), width, OVAL_H, fc="white", ec="#222222", lw=0.7, zorder=2))
    ax.text(cx, cy, label, ha="center", va="center", fontsize=FS, linespacing=1.05, zorder=4)
    return {"left": (cx - width / 2, cy), "right": (cx + width / 2, cy)}


def actor(x, y, label, label_pos="below"):
    """Boneco UML simplificado. (x, y) é o centro da cabeça."""
    r = 0.16
    ax.add_patch(plt.Circle((x, y), r, fc="white", ec="#222222", lw=0.7, zorder=3))
    ax.plot([x, x], [y - r, y - 0.62], color="#222222", lw=0.7, zorder=3)
    ax.plot([x - 0.22, x + 0.22], [y - 0.28, y - 0.28], color="#222222", lw=0.7, zorder=3)
    ax.plot([x, x - 0.2], [y - 0.62, y - 0.95], color="#222222", lw=0.7, zorder=3)
    ax.plot([x, x + 0.2], [y - 0.62, y - 0.95], color="#222222", lw=0.7, zorder=3)
    ly = y - 1.13 if label_pos == "below" else y + 0.36
    ax.text(x, ly, label, ha="center", va="center", fontsize=8, fontweight="bold")
    return {"x": x, "y": y}


def hand(a, side):
    """Ponto da mão do boneco voltada para o lado indicado ('left' ou 'right')."""
    return (a["x"] + (0.22 if side == "right" else -0.22), a["y"] - 0.28)


def link(start, end):
    ax.plot([start[0], end[0]], [start[1], end[1]], color="#444444", lw=0.6, zorder=1)


def generalization(child_feet_or_head, parent_point):
    """Seta de generalização (triângulo vazado) do filho para o pai."""
    ax.annotate(
        "", xy=parent_point, xytext=child_feet_or_head,
        arrowprops=dict(arrowstyle="-|>,head_width=0.18,head_length=0.30", color="#222222",
                        lw=0.7, fc="white", shrinkA=0, shrinkB=0),
    )


# Atores de uso geral (à esquerda)
visitante = actor(0.9, 6.95, "Visitante")
atleta = actor(0.9, 4.35, "Atleta", label_pos="above")
lojista = actor(0.9, 1.85, "Lojista")

# Atores de gestão (à direita)
supervisor = actor(9.1, 5.55, "Supervisor", label_pos="above")
administrador = actor(9.1, 2.2, "Administrador")

# Casos de uso da coluna esquerda (ordem vertical de cima para baixo)
ys_left = [7.5 - i * 0.76 for i in range(10)]
left_labels = [
    "UC01 Navegar no\ncatálogo",
    "UC02 Cadastrar-se\ne entrar",
    "UC03 Comprar\nproduto",
    "UC04 Acompanhar\npedidos",
    "UC05 Anunciar item\n(C2C)",
    "UC06 Participar da\ncomunidade",
    "UC07 Denunciar\npublicação",
    "UC08 Criar loja",
    "UC09 Gerenciar\nanúncios B2C",
    "UC10 Solicitar\nverificação",
]
uc_left = [use_case(LEFT_CX, y, lbl, LEFT_W) for y, lbl in zip(ys_left, left_labels)]

# Casos de uso da coluna direita (gestão)
right_items = [
    (6.45, "UC11 Verificar lojas"),
    (5.0, "UC12 Suspender e\nreativar contas"),
    (3.55, "UC13 Moderar conteúdo\ne pedidos"),
    (2.1, "UC14 Alterar papéis\ne excluir contas"),
]
uc_right = [use_case(RIGHT_CX, y, lbl, RIGHT_W) for y, lbl in right_items]

# Associações: visitante, atleta e lojista (esquerda)
for i in (0, 1):
    link(hand(visitante, "right"), uc_left[i]["left"])
for i in (2, 3, 4, 5, 6, 7):  # UC03..UC08 (inclui criar loja: o atleta cria a loja e passa a lojista)
    link(hand(atleta, "right"), uc_left[i]["left"])
for i in (7, 8, 9):
    link(hand(lojista, "right"), uc_left[i]["left"])

# Associações: supervisor e administrador (direita)
for i in (0, 1, 2):
    link(hand(supervisor, "left"), uc_right[i]["right"])
link(hand(administrador, "left"), uc_right[3]["right"])

# Generalizações: lojista é um atleta; administrador é um supervisor
generalization((0.9, 2.03), (0.9, 3.40))   # cabeça do lojista -> pés do atleta
generalization((9.1, 2.38), (9.1, 4.60))   # cabeça do administrador -> pés do supervisor

fig.savefig(OUT / "caso-de-uso.png", dpi=300)
fig.savefig(OUT / "caso-de-uso.svg")
print("Gerado:", OUT / "caso-de-uso.png", "e caso-de-uso.svg")
