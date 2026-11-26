import { deleteManagedRecord, listManagedRecords, updateManagedRecord } from "./managedDataService.js";

export const listContactRequests = (options) => listManagedRecords("requests", options);
export const updateContactRequest = (id, payload) => updateManagedRecord("requests", id, payload);
export const deleteContactRequest = (id) => deleteManagedRecord("requests", id);
