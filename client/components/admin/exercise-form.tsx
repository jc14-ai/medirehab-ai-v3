import { useState, useEffect } from "react";
import { type ApiExercise, type ExerciseImage } from "@/lib/api";

export function ExerciseForm({
  isOpen,
  initialData,
  onSave,
  onCancel,
  isLoading,
}: {
  isOpen: boolean;
  initialData?: ApiExercise;
  onSave: (data: { name: string; description: string; images: ExerciseImage[] }) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<{ name: string; description: string; images: ExerciseImage[] }>({
    name: "",
    description: "",
    images: [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        images: initialData.images || [],
      });
    } else {
      setFormData({ name: "", description: "", images: [] });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (index: number, field: keyof ExerciseImage, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = { ...newImages[index], [field]: value };
    setFormData({ ...formData, images: newImages });
  };

  const handleAddImage = () => {
    setFormData({ ...formData, images: [...formData.images, { imageName: "", filepath: "" }] });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "20px",
      }}
      onClick={onCancel}
    >
      <div
        className="card animate-slide-up"
        style={{ width: "100%", maxWidth: "500px", padding: "24px", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 20px 0", color: "var(--color-text-primary)" }}>
          {initialData ? "Edit Exercise" : "Create Exercise"}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>Exercise Name</label>
            <input type="text" name="name" className="input" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>Description</label>
            <textarea
              name="description"
              className="input"
              value={formData.description}
              onChange={handleChange}
              style={{ minHeight: "80px", padding: "10px 14px" }}
              required
            />
          </div>
          
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500 }}>Images</label>
              <button type="button" className="btn btn-secondary" style={{ height: "28px", padding: "0 8px", fontSize: "12px" }} onClick={handleAddImage}>
                + Add Image
              </button>
            </div>
            {formData.images.length === 0 && (
              <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>No images added.</div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {formData.images.map((img, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="Image Name (e.g. squat_pose)"
                      value={img.imageName}
                      onChange={(e) => handleImageChange(i, "imageName", e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="input"
                      placeholder="Filepath (e.g. /exercises/squat.png)"
                      value={img.filepath}
                      onChange={(e) => handleImageChange(i, "filepath", e.target.value)}
                      required
                    />
                  </div>
                  <button type="button" className="btn btn-danger" style={{ padding: "0 8px" }} onClick={() => handleRemoveImage(i)}>
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ minWidth: "100px" }}>
              {isLoading ? <div className="spinner spinner-white" style={{ width: "16px", height: "16px" }} /> : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
