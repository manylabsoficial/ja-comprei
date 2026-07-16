import bpy
import json
import math
from mathutils import Vector

scene = bpy.context.scene
col = bpy.data.collections.get("SCENE_01_CHEGADA_MERCADO_SCROLLABLE")
if not col:
    raise RuntimeError("SCENE_01_CHEGADA_MERCADO_SCROLLABLE not found")


def ensure_mat(name, color, roughness=0.65, metallic=0.0, alpha=1.0, emission=None, emission_strength=0.0):
    material = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        values = {
            "Base Color": color,
            "Roughness": roughness,
            "Metallic": metallic,
            "Alpha": alpha,
        }
        for input_name, value in values.items():
            if input_name in bsdf.inputs:
                bsdf.inputs[input_name].default_value = value
        if emission:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = emission
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = emission_strength
    if alpha < 1:
        material.blend_method = "BLEND"
        material.show_transparent_back = True
    return material


def link(obj):
    if obj.name not in col.objects:
        col.objects.link(obj)
    return obj


def remove_if_exists(prefix):
    for obj in list(bpy.data.objects):
        if obj.name.startswith(prefix):
            bpy.data.objects.remove(obj, do_unlink=True)


remove_if_exists("S01_REFINE_")

mat_counter = ensure_mat("S01_MAT_countertop_warm_honed_stone_v2", (0.43, 0.39, 0.33, 1), 0.78)
mat_kraft = ensure_mat("S01_MAT_kraft_paper_varied_v2", (0.54, 0.39, 0.22, 1), 0.92)
mat_kraft_dark = ensure_mat("S01_MAT_kraft_fold_shadow_v2", (0.30, 0.20, 0.11, 1), 0.95)
mat_paper = ensure_mat("S01_MAT_receipt_warm_thermal_paper_v2", (0.88, 0.85, 0.76, 1), 0.88)
mat_ink = ensure_mat("S01_MAT_receipt_soft_graphite_rows_v2", (0.06, 0.055, 0.048, 1), 0.96)
mat_sage = ensure_mat(
    "S01_MAT_sage_reflection_premium_v2",
    (0.19, 0.82, 0.54, 0.48),
    0.25,
    alpha=0.48,
    emission=(0.15, 0.70, 0.44, 1),
    emission_strength=0.38,
)
mat_tomato = ensure_mat("S01_MAT_tomato_skin_deeper_v2", (0.78, 0.055, 0.035, 1), 0.48)
mat_tomato_high = ensure_mat("S01_MAT_tomato_soft_highlight_v2", (1.0, 0.36, 0.23, 0.42), 0.25, alpha=0.42)
mat_leaf = ensure_mat("S01_MAT_leafy_greens_varied_v2", (0.08, 0.34, 0.14, 1), 0.78)
mat_leaf_light = ensure_mat("S01_MAT_leaf_veins_lively_v2", (0.40, 0.70, 0.30, 1), 0.75)
mat_lemon = ensure_mat("S01_MAT_lemon_skin_deeper_v2", (0.92, 0.70, 0.10, 1), 0.68)
mat_bread = ensure_mat("S01_MAT_bread_crust_toasted_v2", (0.62, 0.34, 0.13, 1), 0.76)
mat_bread_cut = ensure_mat("S01_MAT_bread_cut_warm_v2", (0.95, 0.73, 0.43, 1), 0.80)
mat_onion = ensure_mat("S01_MAT_onion_skin_v2", (0.64, 0.48, 0.32, 1), 0.72)
mat_rice = ensure_mat("S01_MAT_rice_bag_cloth_v2", (0.74, 0.70, 0.58, 1), 0.86)
mat_dark_wall = ensure_mat("S01_MAT_deep_shadow_side_wall_v2", (0.075, 0.075, 0.067, 1), 0.82)
mat_warm_wall = ensure_mat("S01_MAT_warm_plaster_wall_v2", (0.53, 0.42, 0.31, 1), 0.86)


def add_bump_nodes(material, scale=35, strength=0.04):
    if not material or not material.use_nodes:
        return
    nt = material.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    if not bsdf or "Normal" not in bsdf.inputs:
        return
    for node in list(nt.nodes):
        if node.name.startswith("S01_REFINE_noise_texture") or node.name.startswith("S01_REFINE_bump"):
            nt.nodes.remove(node)
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.name = "S01_REFINE_noise_texture"
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = 9
    noise.inputs["Roughness"].default_value = 0.58
    bump = nt.nodes.new("ShaderNodeBump")
    bump.name = "S01_REFINE_bump"
    bump.inputs["Strength"].default_value = strength
    bump.inputs["Distance"].default_value = 0.045
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])


for material, scale, strength in [
    (mat_counter, 52, 0.028),
    (mat_kraft, 38, 0.055),
    (mat_paper, 85, 0.018),
    (mat_tomato, 70, 0.020),
    (mat_lemon, 96, 0.045),
    (mat_bread, 34, 0.060),
    (mat_onion, 46, 0.035),
    (mat_rice, 42, 0.035),
    (mat_warm_wall, 28, 0.022),
]:
    add_bump_nodes(material, scale, strength)


def add_modifier_once(obj, name, modifier_type):
    modifier = obj.modifiers.get(name)
    if modifier:
        return modifier
    return obj.modifiers.new(name, modifier_type)


for obj in col.objects:
    if obj.type != "MESH":
        continue
    name = obj.name
    if "countertop" in name:
        obj.data.materials.clear()
        obj.data.materials.append(mat_counter)
    elif "thermal_receipt" in name:
        obj.data.materials.clear()
        obj.data.materials.append(mat_paper)
    elif "receipt_abstract" in name:
        obj.data.materials.clear()
        obj.data.materials.append(mat_ink)
    elif "kraft_grocery_bag" in name:
        obj.data.materials.clear()
        obj.data.materials.append(mat_kraft)
    elif "tomato" in name and "stem" not in name:
        obj.data.materials.clear()
        obj.data.materials.append(mat_tomato)
    elif "lemon" in name:
        obj.data.materials.clear()
        obj.data.materials.append(mat_lemon)
    elif "leafy_green" in name or "counter_leafy" in name:
        obj.data.materials.clear()
        obj.data.materials.append(mat_leaf)
    elif "bread_loaf" in name and "score" not in name:
        obj.data.materials.clear()
        obj.data.materials.append(mat_bread)
    elif "rice_bag" in name:
        obj.data.materials.clear()
        obj.data.materials.append(mat_rice)
    elif "onion" in name:
        obj.data.materials.clear()
        obj.data.materials.append(mat_onion)
    elif "background_wall" in name:
        obj.data.materials.clear()
        obj.data.materials.append(mat_warm_wall)

    for polygon in obj.data.polygons:
        polygon.use_smooth = True

    if any(key in name for key in ["countertop", "bag", "rice_bag", "receipt_abstract", "thermal_receipt"]):
        bevel = add_modifier_once(obj, "S01_REFINE_soft_bevel", "BEVEL")
        bevel.width = 0.018 if "receipt" not in name else 0.006
        bevel.segments = 3 if "receipt" not in name else 1
        try:
            bevel.affect = "EDGES"
        except Exception:
            pass
        weighted = add_modifier_once(obj, "S01_REFINE_weighted_normals", "WEIGHTED_NORMAL")
        weighted.keep_sharp = True

    if any(key in name for key in ["tomato", "lemon", "onion", "bread_loaf"]):
        sub = add_modifier_once(obj, "S01_REFINE_food_subdivision", "SUBSURF")
        sub.levels = 1
        sub.render_levels = 1
        disp = add_modifier_once(obj, "S01_REFINE_micro_surface_variation", "DISPLACE")
        texture = bpy.data.textures.get(name + "_micro_noise") or bpy.data.textures.new(name + "_micro_noise", "VORONOI")
        texture.noise_scale = 1.1
        texture.intensity = 0.18
        disp.texture = texture
        disp.strength = 0.004 if "tomato" in name or "lemon" in name else 0.006


def cube_mesh(name, dims, loc, material, rot=(0, 0, 0), bevel_ratio=0.18):
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
    obj.data.materials.append(material)
    link(obj)
    bevel = obj.modifiers.new("S01_REFINE_soft_bevel", "BEVEL")
    bevel.width = min(dims) * bevel_ratio
    bevel.segments = 3
    obj.modifiers.new("S01_REFINE_weighted_normals", "WEIGHTED_NORMAL")
    return obj


def curve(name, points, material, bevel=0.01):
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
    obj.data.materials.append(material)
    link(obj)
    return obj


def sphere(name, radius, loc, scale, material, seg=32, rings=16):
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
    obj.data.materials.append(material)
    link(obj)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


bag_specs = [
    ("S01_REFINE_primary_bag", 1.04, 0.82, 1.08, 1.0, math.radians(3)),
    ("S01_REFINE_secondary_bag", 2.00, 0.70, 0.79, 0.72, math.radians(-8)),
]
for prefix, x, y, ztop, scale, rz in bag_specs:
    cube_mesh(prefix + "_folded_top_front_lip", (0.90 * scale, 0.035 * scale, 0.06 * scale), (x, y - 0.335 * scale, ztop), mat_kraft_dark, (0, 0, rz))
    cube_mesh(prefix + "_folded_top_back_lip", (0.90 * scale, 0.035 * scale, 0.06 * scale), (x, y + 0.335 * scale, ztop), mat_kraft_dark, (0, 0, rz))
    cube_mesh(prefix + "_folded_top_left_lip", (0.035 * scale, 0.68 * scale, 0.055 * scale), (x - 0.445 * scale, y, ztop), mat_kraft_dark, (0, 0, rz))
    cube_mesh(prefix + "_folded_top_right_lip", (0.035 * scale, 0.68 * scale, 0.055 * scale), (x + 0.445 * scale, y, ztop), mat_kraft_dark, (0, 0, rz))
    for i, xo in enumerate([-0.26, -0.10, 0.12, 0.29]):
        curve(
            f"{prefix}_vertical_paper_crease_{i+1}",
            [
                (x + xo * scale, y - 0.345 * scale, 0.20 * scale),
                (x + (xo + 0.02 * math.sin(i)) * scale, y - 0.35 * scale, 0.58 * scale),
                (x + (xo - 0.015) * scale, y - 0.345 * scale, 0.98 * scale),
            ],
            mat_kraft_dark,
            0.0045 * scale,
        )

for obj in list(col.objects):
    if obj.name.startswith("S01_foreground_tomato_cluster_"):
        loc = obj.location
        suffix = obj.name.rsplit("_", 1)[-1]
        sphere("S01_REFINE_tomato_catchlight_" + suffix, 0.035, (loc.x - 0.045, loc.y - 0.11, loc.z + 0.07), (1.5, 0.5, 0.18), mat_tomato_high, 16, 8)
        for i in range(5):
            angle = i * math.tau / 5
            cube_mesh(
                f"S01_REFINE_tomato_calyx_{suffix}_{i}",
                (0.07, 0.018, 0.008),
                (loc.x + 0.032 * math.cos(angle), loc.y + 0.032 * math.sin(angle), loc.z + 0.155),
                mat_leaf,
                (0, math.radians(12), angle),
                0.25,
            )
    if obj.name.startswith("S01_foreground_lemon_"):
        loc = obj.location
        suffix = obj.name.rsplit("_", 1)[-1]
        for i in range(18):
            angle = i * math.tau / 18
            sphere(
                f"S01_REFINE_lemon_pore_{suffix}_{i:02d}",
                0.006,
                (loc.x + 0.13 * math.cos(angle) * 0.65, loc.y + 0.08 * math.sin(angle), loc.z + 0.04 * math.sin(angle * 2)),
                (1, 1, 1),
                mat_bread_cut,
                8,
                4,
            )

curve("S01_REFINE_receipt_front_edge_shadow", [(-1.40, -2.08, 0.045), (-1.05, -2.12, 0.039), (-0.66, -2.06, 0.043)], mat_ink, 0.006)
curve("S01_REFINE_receipt_left_soft_shadow", [(-1.40, -1.85, 0.035), (-1.36, -1.18, 0.04), (-1.33, -0.24, 0.052)], mat_kraft_dark, 0.004)
cube_mesh("S01_REFINE_faint_sage_counter_reflection", (1.45, 0.012, 0.006), (-0.64, -0.76, 0.019), mat_sage, (0, 0, math.radians(-11)), 0.3)
cube_mesh("S01_REFINE_deep_side_shadow_wall", (0.12, 3.4, 2.7), (2.90, 0.10, 1.18), mat_dark_wall, (0, 0, 0), 0.05)


def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


cam = bpy.data.objects.get("S01_Camera_scroll_scene_01_macro_hero")
if cam:
    scene.camera = cam
    cam.location = (-2.65, -3.55, 1.26)
    look_at(cam, (-0.18, -0.26, 0.32))
    cam.data.lens = 31
    cam.data.dof.aperture_fstop = 3.4
    cam.keyframe_insert(data_path="location", frame=1)
    cam.keyframe_insert(data_path="rotation_euler", frame=1)
    cam.location = (-2.32, -2.90, 1.12)
    look_at(cam, (-0.05, -0.15, 0.28))
    cam.keyframe_insert(data_path="location", frame=90)
    cam.keyframe_insert(data_path="rotation_euler", frame=90)
    scene.frame_set(1)

key = bpy.data.objects.get("S01_Key_Area_Warm_Window_Light")
if key:
    key.location = (-2.9, -2.4, 3.35)
    key.data.energy = 430
    key.data.size = 5.2
fill = bpy.data.objects.get("S01_Subtle_Sage_Fill_for_AI_Mood")
if fill:
    fill.location = (2.3, -1.15, 0.86)
    fill.data.energy = 34
    fill.data.size = 2.8
practical = bpy.data.objects.get("S01_Background_Warm_Practical_Glow")
if practical:
    practical.location = (1.15, 1.45, 1.85)
    practical.data.energy = 82

try:
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.view_settings.exposure = -0.15
    scene.view_settings.gamma = 1.0
except Exception:
    pass

try:
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 128
    scene.cycles.preview_samples = 48
except Exception:
    pass

scene["scene_01_refine_pass"] = "v2_materials_bevels_bag_creases_food_microdetail_lighting"
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=r"C:\Users\emanu\Documents\Projetos\Já comprei\blend.blend")
print(json.dumps({
    "status": "refined_v2",
    "objects": len(col.objects),
    "camera": scene.camera.name if scene.camera else None,
    "pass": scene.get("scene_01_refine_pass"),
}, ensure_ascii=False))
