import bpy
import json
import math

scene = bpy.context.scene
col = bpy.data.collections.get("SCENE_01_CHEGADA_MERCADO_SCROLLABLE")
if not col:
    raise RuntimeError("SCENE_01_CHEGADA_MERCADO_SCROLLABLE not found")


def link(obj):
    if obj.name not in col.objects:
        col.objects.link(obj)
    return obj


def material(name, color, roughness=0.75):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        if "Base Color" in bsdf.inputs:
            bsdf.inputs["Base Color"].default_value = color
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = roughness
    return mat


mat_rice = material("S01_MAT_rice_sack_fabric_v3", (0.66, 0.61, 0.49, 1), 0.9)
mat_rice_shadow = material("S01_MAT_rice_sack_seam_shadow_v3", (0.30, 0.25, 0.17, 1), 0.95)
mat_bread_groove = material("S01_MAT_bread_groove_toasted_v3", (0.30, 0.16, 0.055, 1), 0.92)
mat_leaf = bpy.data.materials.get("S01_MAT_leafy_greens_varied_v2") or material("S01_MAT_leafy_greens_varied_v2", (0.08, 0.34, 0.14, 1), 0.78)


def remove_prefix(prefix):
    for obj in list(bpy.data.objects):
        if obj.name.startswith(prefix):
            bpy.data.objects.remove(obj, do_unlink=True)


remove_prefix("S01_REFINE_V3_")

# Hide prototype objects that read as temporary geometry.
for obj in bpy.data.objects:
    if obj.name.startswith("S01_midground_plain_rice_bag_no_label"):
        obj.hide_viewport = True
        obj.hide_render = True
    if obj.name.startswith("S01_bread_loaf_soft_score_"):
        obj.hide_viewport = True
        obj.hide_render = True


def sphere(name, radius, loc, scale, mat, seg=40, rings=20):
    verts = []
    faces = []
    for r in range(rings + 1):
        phi = math.pi * r / rings
        for s in range(seg):
            theta = 2 * math.pi * s / seg
            verts.append((
                radius * math.sin(phi) * math.cos(theta) * scale[0],
                radius * math.sin(phi) * math.sin(theta) * scale[1],
                radius * math.cos(phi) * scale[2],
            ))
    for r in range(rings):
        for s in range(seg):
            a = r * seg + s
            b = r * seg + (s + 1) % seg
            c = (r + 1) * seg + (s + 1) % seg
            d = (r + 1) * seg + s
            faces.append((a, b, c, d))
    mesh = bpy.data.meshes.new(name + "Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    obj.location = loc
    obj.data.materials.append(mat)
    link(obj)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def curve(name, points, mat, bevel=0.01):
    cu = bpy.data.curves.new(name + "Curve", "CURVE")
    cu.dimensions = "3D"
    cu.resolution_u = 18
    cu.bevel_depth = bevel
    cu.bevel_resolution = 3
    spline = cu.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for point, co in zip(spline.points, points):
        point.co = (co[0], co[1], co[2], 1)
    obj = bpy.data.objects.new(name, cu)
    obj.data.materials.append(mat)
    link(obj)
    return obj


def cube(name, dims, loc, mat, rot=(0, 0, 0)):
    x, y, z = dims[0] / 2, dims[1] / 2, dims[2] / 2
    verts = [
        (-x, -y, -z), (x, -y, -z), (x, y, -z), (-x, y, -z),
        (-x, -y, z), (x, -y, z), (x, y, z), (-x, y, z),
    ]
    faces = [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]
    mesh = bpy.data.meshes.new(name + "Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    obj.location = loc
    obj.rotation_euler = rot
    obj.data.materials.append(mat)
    link(obj)
    bevel = obj.modifiers.new("S01_REFINE_V3_soft_bevel", "BEVEL")
    bevel.width = min(dims) * 0.25
    bevel.segments = 4
    obj.modifiers.new("S01_REFINE_V3_weighted_normals", "WEIGHTED_NORMAL")
    return obj


# Organic rice sack: low, rounded, with seams instead of a white block.
rice = sphere("S01_REFINE_V3_organic_rice_sack", 0.42, (-0.22, 0.57, 0.30), (0.82, 0.48, 0.62), mat_rice)
rice.rotation_euler = (math.radians(5), math.radians(-9), math.radians(13))
sub = rice.modifiers.new("S01_REFINE_V3_soft_cloth_subdivision", "SUBSURF")
sub.levels = 1
sub.render_levels = 1
disp = rice.modifiers.new("S01_REFINE_V3_fabric_irregularity", "DISPLACE")
tex = bpy.data.textures.get("S01_REFINE_V3_rice_sack_noise") or bpy.data.textures.new("S01_REFINE_V3_rice_sack_noise", "CLOUDS")
tex.noise_scale = 0.75
tex.noise_depth = 4
disp.texture = tex
disp.strength = 0.015
curve("S01_REFINE_V3_rice_sack_top_seam", [(-0.48, 0.48, 0.62), (-0.24, 0.57, 0.68), (0.05, 0.64, 0.60)], mat_rice_shadow, 0.012)
for i, xo in enumerate([-0.22, -0.06, 0.10]):
    curve(
        f"S01_REFINE_V3_rice_sack_fabric_fold_{i+1}",
        [(-0.33 + xo, 0.38, 0.26), (-0.29 + xo, 0.56, 0.37), (-0.21 + xo, 0.73, 0.25)],
        mat_rice_shadow,
        0.006,
    )

# Bread grooves: shallow dark curved cuts glued to the loaf silhouette.
for i, offset in enumerate([-0.18, 0.00, 0.18]):
    groove = curve(
        f"S01_REFINE_V3_bread_surface_groove_{i+1}",
        [
            (1.23 + offset, -0.79, 0.44),
            (1.33 + offset, -0.69, 0.49),
            (1.47 + offset, -0.57, 0.43),
        ],
        mat_bread_groove,
        0.015,
    )
    groove.rotation_euler[2] = math.radians(-11)

# Small herb pieces near the tomatoes to break the perfect procedural silhouette.
for i in range(10):
    angle = i * math.tau / 10
    cube(
        f"S01_REFINE_V3_loose_herb_piece_{i+1:02d}",
        (0.07, 0.014, 0.006),
        (0.05 + 0.23 * math.cos(angle) * 0.55, -0.43 + 0.12 * math.sin(angle), 0.35 + 0.02 * math.sin(angle * 2)),
        mat_leaf,
        (math.radians(12), math.radians(8), angle),
    )

# Tune the faint sage reflection down slightly after adding more details.
sage = bpy.data.objects.get("S01_REFINE_faint_sage_counter_reflection")
if sage:
    sage.scale.y = 0.55

scene["scene_01_refine_pass"] = "v3_replace_blocky_rice_bag_fix_bread_grooves"
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=r"C:\Users\emanu\Documents\Projetos\Já comprei\blend.blend")
print(json.dumps({
    "status": "refined_v3",
    "objects": len(col.objects),
    "pass": scene.get("scene_01_refine_pass"),
}, ensure_ascii=False))
