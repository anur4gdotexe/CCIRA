package com.ccira_apis.maps;

import com.ccira_apis.admin_bodies.PolygonRepository;
import org.json.JSONArray;
import org.json.JSONObject;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.io.ParseException;
import org.locationtech.jts.io.geojson.GeoJsonReader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class LocationAdminService {
    private final LocationAdminRepository locationAdminRepository;
    private final PolygonRepository polygonRepository;

    public LocationAdminService (LocationAdminRepository locationAdminRepository,
                                 PolygonRepository polygonRepository) {
        this.locationAdminRepository = locationAdminRepository;
        this.polygonRepository = polygonRepository;
    }

    public List<String> getAdminIds(String state, String district, String category, double lat, double lon) {
//        boolean handlesRoad = false, handlesSewage = false, handlesWaste = false, handlesWater = false;


        List<String> listOfAdminIds = locationAdminRepository.findByStateAndDistrict(state, district).stream()
                .filter(lam -> (category.equals("ROAD") && lam.getHandlesRoad())
                        || (category.equals("SEWAGE") && lam.getHandlesSewage())
                        || (category.equals("WASTE") && lam.getHandlesWaste())
                        || (category.equals("WATER") && lam.getHandlesWater()))
                .map(lam -> lam.getAdminId())
                .filter(adminId -> !polygonRepository.findByAdminId(adminId).isEmpty())
                .filter(adminId -> {
                    try {
                        return pointCheck(lat, lon, polygonRepository.findByAdminId(adminId).get(0).getFileName());
                    } catch (Exception e) {
                        System.out.println("\n\n\nISKI GALIT HAI\n\n\n");
                        throw new RuntimeException("something went wrong with file parsing", e);
                    }
                })
                .toList();

        System.out.println("\n\n\n" + listOfAdminIds.toString());
        return listOfAdminIds;
    }

    private boolean pointCheck(double lat, double lon, String fileName) throws Exception{
        String path = "src/main/resources/polygons/" + fileName + ".json";
        JSONObject obj = new JSONObject(Files.readString(Paths.get(path)));

        GeoJsonReader reader = new GeoJsonReader();

        GeometryFactory gf = new GeometryFactory();
        Point pt = gf.createPoint(new Coordinate(lon, lat));

        JSONArray features = obj.getJSONArray("features");

        for (int i = 0; i < features.length(); i++) {
            JSONObject geom = features.getJSONObject(i).getJSONObject("geometry");
            Geometry polygon = reader.read(geom.toString());

            if (polygon.covers(pt)) return true;
        }

        return false;
    }
}
