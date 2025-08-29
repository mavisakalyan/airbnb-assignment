const { ApiError } = require("../../utils");
const { getAllClasses, getClassDetail, addNewClass, updateClassDetailById, deleteClassById } = require("./classes-repository")

const ensureValidId = (id) => {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
        throw new ApiError(400, "Invalid class id");
    }
};

const ensureValidPayload = ({ name, sections }) => {
    if (!name || typeof name !== "string" || !name.trim()) {
        throw new ApiError(400, "Class name is required");
    }
    if (sections != null && typeof sections !== "string") {
        throw new ApiError(400, "Sections must be a string");
    }
};

const fetchAllClasses = async () => {
    const classes = await getAllClasses();
    if (!Array.isArray(classes) || classes.length <= 0) {
        return [];
    }

    return classes;
}

const fetchClassDetail = async (id) => {
    ensureValidId(id);
    const classDetail = await getClassDetail(id);
    if (!classDetail) {
        throw new ApiError(404, "Class detail not found");
    }

    return classDetail;
}

const addClass = async (payload) => {
    ensureValidPayload(payload);
    const affectedRow = await addNewClass(payload);
    if (affectedRow <= 0) {
        throw new ApiError(500, "Unable to add new class");
    }

    return { message: "Class added successfully" };
}

const updateClassDetail = async (payload) => {
    ensureValidId(payload?.id);
    ensureValidPayload(payload);
    const affectedRow = await updateClassDetailById(payload);
    if (affectedRow <= 0) {
        throw new ApiError(404, "Class not found");
    }
    return { message: "Class detail updated successfully" };
}

const deleteClass = async (id) => {
    ensureValidId(id);
    const affectedRow = await deleteClassById(id);
    if (affectedRow <= 0) {
        throw new ApiError(404, "Class not found");
    }
    return { message: "Class deleted successfully" };
}

module.exports = {
    fetchAllClasses,
    fetchClassDetail,
    addClass,
    updateClassDetail,
    deleteClass
};