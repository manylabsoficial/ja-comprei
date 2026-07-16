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


def mat(name, color, roughness=0.86):
    material = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        if "Base Color" in bsdf.inputs:
            bsdf.inputs["Base Color"].default_value = color
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = roughness
    return material


mat_pack = mat("S01_MAT_rice_pack_kraft_v4", (0.43, 0.33, 0.21, 1), 0.94)
mat_pack_line = mat("S01_MAT_rice_pack_fold_line_v4", (0.16, 0.12, 0.08, 1), 0.96)
mat_bread_groove = mat("S01_MAT_bread_flat_groove_v4", (0.22, 0.11, 0.035, 1), 0.94)


def hide_prefix(prefix):
    for obj in bpy.data.objects:
        if obj.name.startswith(prefix):
            obj.hide_viewport = True
            obj.hide_render = True


hide_prefix("S01_REFINE_V3_organic_rice_sack")
hide_prefix("S01_REFINE_V3_rice_sack")
hide_prefix("S01_REFINE_V3_bread_surface_groove")

for obj in list(bpy.data.objects):
    if obj.name.startswith("S01_REFINE_V4_"):
        bpy.data.objects.remove(obj, do_unlink=True)


def cube(name, dims, loc, material, rot=(0, 0, 0), bevel_width=0.025):
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
    bevel = obj.modifiers.new("S01_REFINE_V4_soft_bevel", "BEVEL")
    bevel.width = bevel_width
    bevel.segments = 5
    obj.modifiers.new("S01_REFINE_V4_weighted_normals", "WEIGHTED_NORMAL")
    return obj


def curve(name, points, material, bevel=0.006):
    cu = bpy.data.curves.new(name + "Curve", "CURVE")
    cu.dimensions = "3D"
    cu.resolution_u = 18
    cu.bevel_depth = bevel
    cu.bevel_resolution = 2
    spline = cu.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for point, co in zip(spline.points, points):
        point.co = (co[0], co[1], co[2], 1)
    obj = bpy.data.objects.new(name, cu)
    obj.data.materials.append(material)
    link(obj)
    return obj


# Low, secondary rice pack. It should read as grocery context, not as hero object.
pack = cube(
    "S01_REFINE_V4_soft_kraft_rice_pack_secondary",
    (0.54, 0.22, 0.48),
    (-0.34, 0.54, 0.27),
    mat_pack,
    (math.radians(-4), math.radians(-8), math.radians(13)),
    0.055,
)
disp = pack.modifiers.new("S01_REFINE_V4_pack_fabric_irregularity", "DISPLACE")
texture = bpy.data.textures.get("S01_REFINE_V4_rice_pack_noise") or bpy.data.textures.new("S01_REFINE_V4_rice_pack_noise", "CLOUDS")
texture.noise_scale = 0.55
texture.noise_depth = 4
disp.texture = texture
disp.strength = 0.009

for i, xo in enumerate([-0.16, 0.0, 0.15]):
    curve(
        f"S01_REFINE_V4_rice_pack_front_fold_{i+1}",
        [(-0.48 + xo, 0.41, 0.10), (-0.45 + xo, 0.43, 0.28), (-0.43 + xo, 0.46, 0.46)],
        mat_pack_line,
        0.004,
    )
curve("S01_REFINE_V4_rice_pack_top_seam", [(-0.58, 0.49, 0.51), (-0.36, 0.54, 0.55), (-0.13, 0.58, 0.50)], mat_pack_line, 0.006)

# Flat bread scoring: small dark slashes stuck to the loaf, not elevated handles.
for i, offset in enumerate([-0.16, 0.02, 0.20]):
    groove = cube(
        f"S01_REFINE_V4_bread_flat_score_{i+1}",
        (0.16, 0.018, 0.007),
        (1.42 + offset, -0.66 + 0.02 * i, 0.43),
        mat_bread_groove,
        (math.radians(10), math.radians(0), math.radians(18)),
        0.006,
    )
    groove.scale.x = 1.25

scene["scene_01_refine_pass"] = "v4_secondary_rice_pack_flat_bread_scores"
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=r"C:\Users\emanu\Documents\Projetos\Já comprei\blend.blend")
print(json.dumps({
    "status": "refined_v4",
    "objects": len(col.objects),
    "pass": scene.get("scene_01_refine_pass"),
}, ensure_ascii=False))
