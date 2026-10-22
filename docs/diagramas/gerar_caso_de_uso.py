"""
Gera o diagrama de casos de uso do CoreMotiom (PNG 300 dpi e SVG).

Fonte da verdade: lib/permissions.ts e a matriz de "Papéis e permissões" do README.
Atores: Visitante, Atleta, Lojista (herda de Atleta), Supervisor e Administrador (herda de Supervisor).

Layout: à esquerda ficam os atores de uso geral e os casos de uso que eles acessam;
à direita ficam os atores de gestão e os casos de uso de moderação e administração.
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

fig = plt.figure(figsize=(16 * CM, 19 * CM), dpi=300)
ax = fig.add_axes([0, 0, 1, 1])
ax.set_xlim(0, 10)
ax.set_ylim(0, 11.2)
ax.axis("off")

# Fronteira do sistema
ax.add_patch(Rectangle((2.2, 0.9), 6.3, 9.3, fill=False, lw=0.9, ec="#222222"))
ax.text(5.35, 10.45, "Sistema CoreMotiom", ha="center", va="center", fontsize=9, fontweight="bold")

OVAL_H, FS = 0.56, 7.2
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


def generalization(child_point, parent_point):
    """Seta de generalização (triângulo vazado) do filho para o pai."""
    ax.annotate(
        "", xy=parent_point, xytext=child_point,
        arrowprops=dict(arrowstyle="-|>,head_width=0.18,head_length=0.30", color="#222222",
                        lw=0.7, fc="white", shrinkA=0, shrinkB=0),
    )


# Atores de uso geral (à esquerda)
visitante = actor(0.9, 9.0, "Visitante")
atleta = actor(0.9, 5.4, "Atleta", label_pos="above")
lojista = actor(0.9, 2.4, "Lojista")

# Atores de gestão (à direita)
supervisor = actor(9.1, 5.9, "Supervisor", label_pos="above")
administrador = actor(9.1, 2.6, "Administrador")

# Casos de uso da coluna esquerda (uso geral), de cima para baixo
ys_left = [9.3 - i * 0.80 for i in range(11)]
left_labels = [
    "UC01 Navegar no catálogo\ne na comunidade",
    "UC02 Cadastrar-se e entrar",
    "UC03 Comprar produto",
    "UC04 Acompanhar pedidos",
    "UC05 Anunciar item (C2C)",
    "UC06 Publicar, curtir\ne comentar",
    "UC07 Denunciar publicação",
    "UC08 Criar loja",
    "UC09 Gerenciar loja e\nanúncios B2C",
    "UC10 Solicitar verificação\nda loja",
    "UC11 Gerenciar o\npróprio perfil",
]
uc_left = [use_case(LEFT_CX, y, lbl, LEFT_W) for y, lbl in zip(ys_left, left_labels)]
L = {i + 1: uc_left[i] for i in range(len(uc_left))}  # L[1] = UC01 ...

# Casos de uso da coluna direita (gestão)
ys_right = [9.0 - i * 1.25 for i in range(7)]
right_labels = [
    "UC12 Aprovar ou reprovar\nverificação de loja",
    "UC13 Moderar publicações\ndenunciadas",
    "UC14 Moderar anúncios\nde terceiros",
    "UC15 Gerenciar pedidos e\nconfirmar pagamento",
    "UC16 Listar e suspender\ncontas",
    "UC17 Alterar papéis",
    "UC18 Excluir contas",
]
uc_right = [use_case(RIGHT_CX, y, lbl, RIGHT_W) for y, lbl in zip(ys_right, right_labels)]
R = {12 + i: uc_right[i] for i in range(len(uc_right))}  # R[12] = UC12 ...

# Associações: Visitante, Atleta e Lojista (esquerda)
for n in (1, 2):
    link(hand(visitante, "right"), L[n]["left"])
for n in (1, 3, 4, 5, 6, 7, 8, 11):
    link(hand(atleta, "right"), L[n]["left"])
for n in (9, 10):
    link(hand(lojista, "right"), L[n]["left"])

# Associações: Supervisor e Administrador (direita)
for n in (12, 13, 14, 15, 16):
    link(hand(supervisor, "left"), R[n]["right"])
for n in (17, 18):
    link(hand(administrador, "left"), R[n]["right"])

# Generalizações: Lojista é um Atleta; Administrador é um Supervisor
generalization((0.9, 2.58), (0.9, 4.45))   # cabeça do lojista -> pés do atleta
generalization((9.1, 2.80), (9.1, 4.85))         # cabeça do administrador -> pés do supervisor

# Nota explicativa
ax.text(
    0.2, 0.45,
    "Supervisor e Administrador também realizam UC01, UC03, UC06 e UC07 (matriz de permissões).\n"
    "Administrador herda os casos de uso do Supervisor. Lojista herda os casos de uso do Atleta.",
    ha="left", va="center", fontsize=5.8, color="#333333", linespacing=1.3,
)

fig.savefig(OUT / "caso-de-uso.png", dpi=300)
fig.savefig(OUT / "caso-de-uso.svg")
print("Gerado:", OUT / "caso-de-uso.png", "e caso-de-uso.svg")
